#!/usr/bin/env python3
"""
Log into a home router's admin interface and list connected devices.

Usage:
    python3 router_devices.py [--host 192.168.1.1] [--brand auto|asus|netgear|generic] [--https]

Credentials are prompted interactively (never stored, never passed on the
command line) and used only for this one run.

Supported out of the box:
  - ASUS (Asuswrt / Asuswrt-Merlin)       -> real JSON API
  - Netgear                               -> real SOAP API
  - Anything else ("generic")             -> best-effort HTML scrape;
                                              likely needs tweaking per model.

Requires: pip install requests
"""

import argparse
import getpass
import re
import sys
import warnings
from base64 import b64encode

import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def build_base_url(host: str, use_https: bool) -> str:
    scheme = "https" if use_https else "http"
    return f"{scheme}://{host}"


def detect_brand(session: requests.Session, base_url: str) -> str:
    """Best-effort fingerprint of the router's web UI."""
    try:
        resp = session.get(base_url, timeout=5, verify=False)
    except requests.RequestException as exc:
        print(f"Could not reach {base_url}: {exc}", file=sys.stderr)
        return "generic"

    text = resp.text.lower()
    server = resp.headers.get("Server", "").lower()

    if "asus" in text or "asuswrt" in server:
        return "asus"
    if "netgear" in text or "netgear" in server:
        return "netgear"
    if "tp-link" in text or "tplink" in text:
        return "tplink"
    return "generic"


# ---------------------------------------------------------------------------
# ASUS (Asuswrt / Asuswrt-Merlin) — real JSON API
# ---------------------------------------------------------------------------

def asus_login(session: requests.Session, base_url: str, user: str, password: str) -> bool:
    token = b64encode(f"{user}:{password}".encode()).decode()
    resp = session.post(
        f"{base_url}/login.cgi",
        data={"login_authorization": token},
        timeout=10,
        verify=False,
    )
    return "asus_token" in session.cookies or resp.status_code == 200


def asus_get_clients(session: requests.Session, base_url: str) -> list[dict]:
    resp = session.post(
        f"{base_url}/appGet.cgi",
        data={"hook": "get_clientlist()"},
        timeout=10,
        verify=False,
    )
    resp.raise_for_status()
    data = resp.json()
    clients_raw = data.get("get_clientlist", {})

    devices = []
    for mac, info in clients_raw.items():
        if not isinstance(info, dict):
            continue
        devices.append(
            {
                "mac": mac,
                "ip": info.get("ip", ""),
                "name": info.get("name") or info.get("nickName") or "unknown",
                "online": info.get("isOnline") == "1",
            }
        )
    return devices


# ---------------------------------------------------------------------------
# Netgear — SOAP API
# ---------------------------------------------------------------------------

NETGEAR_SOAP_NS = "urn:NETGEAR-ROUTER:service:DeviceInfo:1"

NETGEAR_ATTACHED_DEVICES_ENVELOPE = """<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
  SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <SOAP-ENV:Header>
    <SessionID>A7D88AE69687E58D9A00</SessionID>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
    <M1:GetAttachDevice xmlns:M1="{ns}"></M1:GetAttachDevice>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>"""


def netgear_get_clients(base_url: str, user: str, password: str) -> list[dict]:
    resp = requests.post(
        f"{base_url}:5000/soap/server_sa/",
        data=NETGEAR_ATTACHED_DEVICES_ENVELOPE.format(ns=NETGEAR_SOAP_NS),
        headers={
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": f"{NETGEAR_SOAP_NS}#GetAttachDevice",
        },
        auth=requests.auth.HTTPBasicAuth(user, password),
        timeout=10,
        verify=False,
    )
    resp.raise_for_status()

    # Response is a single "NewAttachDevice" string, semicolon-separated
    # records of pipe-delimited fields: IP|name|MAC|type|...
    match = re.search(r"<NewAttachDevice>(.*?)</NewAttachDevice>", resp.text, re.S)
    if not match:
        return []

    devices = []
    raw = match.group(1).strip()
    records = raw.split("@")[1:] if "@" in raw else raw.split(";")
    for record in records:
        fields = record.split("|")
        if len(fields) < 3:
            continue
        devices.append({"ip": fields[1], "name": fields[0], "mac": fields[3] if len(fields) > 3 else "", "online": True})
    return devices


# ---------------------------------------------------------------------------
# Generic fallback — form login + best-effort scrape
# ---------------------------------------------------------------------------

GENERIC_LOGIN_PATHS = ["/login.cgi", "/login.html", "/goform/login", "/cgi-bin/login"]
GENERIC_CLIENT_PATHS = [
    "/userRpm/StatusClientRpm.htm",  # TP-Link-ish
    "/status/clients",
    "/index/clients",
    "/dhcp_clients.html",
    "/",
]

MAC_RE = re.compile(r"([0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2}){5})")
IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def generic_login(session: requests.Session, base_url: str, user: str, password: str) -> bool:
    for path in GENERIC_LOGIN_PATHS:
        try:
            resp = session.post(
                base_url + path,
                data={"username": user, "password": password},
                timeout=5,
                verify=False,
            )
            if resp.status_code == 200:
                return True
        except requests.RequestException:
            continue

    # Some routers use HTTP Basic Auth on every request instead of a login form.
    session.auth = requests.auth.HTTPBasicAuth(user, password)
    return True


def generic_get_clients(session: requests.Session, base_url: str) -> list[dict]:
    devices = []
    seen_macs = set()

    for path in GENERIC_CLIENT_PATHS:
        try:
            resp = session.get(base_url + path, timeout=5, verify=False)
        except requests.RequestException:
            continue
        if resp.status_code != 200:
            continue

        macs = MAC_RE.findall(resp.text)
        for mac in macs:
            if mac in seen_macs:
                continue
            seen_macs.add(mac)
            # Grab a nearby IP on the same line as a best-effort pairing.
            line = next((l for l in resp.text.splitlines() if mac in l), "")
            ip_match = IP_RE.search(line)
            devices.append({"mac": mac, "ip": ip_match.group(0) if ip_match else "", "name": "unknown", "online": True})

        if devices:
            break

    return devices


# ---------------------------------------------------------------------------

def print_devices(devices: list[dict]) -> None:
    if not devices:
        print("No devices found (or the parser for this router model needs adjusting).")
        return

    print(f"\nFound {len(devices)} connected device(s):\n")
    print(f"{'IP':<16}{'MAC':<20}{'NAME':<30}{'ONLINE'}")
    print("-" * 76)
    for d in devices:
        print(f"{d.get('ip',''):<16}{d.get('mac',''):<20}{d.get('name',''):<30}{d.get('online','')}")


def main():
    parser = argparse.ArgumentParser(description="List devices connected to a home router.")
    parser.add_argument("--host", default="192.168.1.1", help="Router admin IP/hostname (default: 192.168.1.1)")
    parser.add_argument("--brand", choices=["auto", "asus", "netgear", "generic"], default="auto")
    parser.add_argument("--https", action="store_true", help="Use HTTPS instead of HTTP for the admin UI")
    args = parser.parse_args()

    base_url = build_base_url(args.host, args.https)

    user = input("Router username: ").strip()
    password = getpass.getpass("Router password: ")

    session = requests.Session()

    brand = args.brand
    if brand == "auto":
        brand = detect_brand(session, base_url)
        print(f"Detected router type: {brand}")

    devices: list[dict] = []

    if brand == "asus":
        if not asus_login(session, base_url, user, password):
            print("ASUS login failed.", file=sys.stderr)
            sys.exit(1)
        devices = asus_get_clients(session, base_url)

    elif brand == "netgear":
        devices = netgear_get_clients(base_url, user, password)

    else:
        if brand == "tplink":
            print("TP-Link web UIs vary a lot by model; falling back to generic scraping.")
        if not generic_login(session, base_url, user, password):
            print("Generic login failed.", file=sys.stderr)
            sys.exit(1)
        devices = generic_get_clients(session, base_url)

    print_devices(devices)


if __name__ == "__main__":
    main()
