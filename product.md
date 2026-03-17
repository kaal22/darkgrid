# Product.md — Global Threat Intelligence Dashboard

## 1. Product Overview

Build a public, real-time cyber threat intelligence dashboard that aggregates open-source threat data and visualizes suspicious internet infrastructure globally.

The platform will ingest publicly available indicators such as:

- malicious IP addresses
- phishing URLs
- suspicious domains
- malware command-and-control servers
- internet scanning infrastructure
- exposed vulnerable services

The system correlates these indicators, enriches them with reputation and infrastructure data, and presents them in an interactive analyst dashboard with:

- a global threat map
- live threat feed
- searchable indicator intelligence
- infrastructure relationship graphs
- campaign clustering

The goal is to provide **situational awareness of suspicious internet infrastructure**, not to identify individuals.

The interface should feel similar to a cinematic cyber intelligence console while remaining grounded in real OSINT data.

---

## 2. Core Concept

The internet’s malicious infrastructure is publicly visible but fragmented across many feeds.

Examples include:

- abuse reports
- phishing databases
- malware samples
- scanning activity
- exposed services
- suspicious URLs

The product stitches these signals together into a unified system.

The result is a continuously updating **global infrastructure intelligence dashboard**.

---

## 3. Target Users

### Security researchers
Investigate malicious infrastructure and campaign patterns.

### OSINT analysts
Explore relationships between domains, IPs, and hosting networks.

### cybersecurity students
Learn how threat infrastructure works.

### developers
Access public threat data through an API.

### curious observers
View global cyber threat activity.

---

## 4. Key Features

### Global Threat Map

A real-time world map showing suspicious infrastructure nodes.

Node types include:

- malicious IPs
- phishing hosts
- botnet command servers
- scanning infrastructure
- exposed vulnerable services

Clicking a node reveals intelligence about that entity.

Example node card:

IP: 185.220.101.12  
Country: Germany  
ASN: AS12345  
Provider: VPS Hosting  
Abuse score: 82  
Tags: SSH brute force, scanner  
Open ports: 22, 443

---

### Live Threat Feed

A continuously updating stream of newly discovered indicators.

Example events:

New phishing URL detected  
IP flagged for SSH brute force  
New malware command server identified  
Domain linked to botnet infrastructure

This feed allows analysts to observe emerging infrastructure in near real time.

---

### Indicator Intelligence Lookup

Users can search for:

- IP addresses
- domains
- URLs

Each indicator has a detailed intelligence page.

Example:

Indicator: 185.220.101.12

Country: Germany  
ASN: AS12345  
Hosting Provider: VPS Network  
Abuse Confidence: 84  
GreyNoise Classification: internet scanner  

Related Infrastructure:

Domains: 4  
URLs: 6  
Certificates: 1

Observed Services:

22 SSH  
443 HTTPS

---

### Infrastructure Relationship Graph

Visual graph linking entities.

Relationships include:

URL → Domain  
Domain → IP  
IP → ASN  
Domain → TLS certificate  
Certificate → other domains

This graph helps identify shared infrastructure.

Example graph chain:

phishing_page  
→ redirect_domain  
→ hosting_ip  
→ TLS certificate  
→ other_domains_using_certificate

---

### Campaign Clustering

Indicators are grouped into campaigns using signals such as:

- shared hosting ASN
- shared TLS certificate
- identical phishing kit
- domain registration timing
- redirect patterns

Example campaign summary:

Campaign ID: C-23  
Type: phishing kit  
Domains: 18  
IPs: 4  
ASN: AS14061  
First seen: 48 hours ago

---

### Indicator Timeline

Historical tracking of infrastructure.

Shows:

first seen  
last seen  
activity bursts  
cluster relationships

This helps analysts understand campaign evolution.

---

### ASN and Infrastructure Explorer

Allows users to explore infrastructure by hosting provider.

Example:

ASN: AS14061

Country: Netherlands  
Known indicators: 41  
Phishing domains: 12  
Malware servers: 6  
Scanning IPs: 23

---

## 5. Data Sources

Indicators will be aggregated from publicly available feeds.

### AbuseIPDB

Provides IP abuse reports.

Data includes:

- abuse confidence
- report count
- attack categories
- ASN / ISP

---

### urlscan

Provides URL behavior and relationships.

Includes:

- contacted domains
- network requests
- screenshots
- redirect chains

---

### VirusTotal

Provides reputation and relationships.

Includes:

- malicious URL detection
- domain reputation
- IP relationships
- malware indicators

---

### AlienVault OTX

Community threat intelligence platform.

Provides:

- shared indicators
- campaign intelligence
- malware infrastructure

---

### PhishTank / OpenPhish

Provides active phishing URLs.

Useful for phishing campaign detection.

---

### GreyNoise

Provides internet scanning classification.

Distinguishes:

benign scanning  
research scanning  
malicious scanning

---

### Shodan

Provides exposed service data.

Includes:

- open ports
- service banners
- device information

---

### Censys

Provides internet scanning intelligence.

Includes:

- TLS certificates
- host service data
- exposure patterns

---

### Spamhaus

Provides lists of known malicious networks.

Includes:

DROP lists  
botnet infrastructure

---

### MalwareBazaar

Provides malware samples and infrastructure indicators.

---

### GeoIP / ASN Data

MaxMind GeoLite  
IPinfo

Used for:

country mapping  
hosting provider detection

---

## 6. System Architecture

### Data Ingestion Layer

Collectors retrieve indicators from APIs and feeds.

Collectors run periodically.

Examples:

collector_abuseipdb  
collector_phishtank  
collector_otx  
collector_urlscan  
collector_greynoise  
collector_spamhaus

Collector tasks:

fetch data  
normalize indicators  
deduplicate entries  
queue enrichment jobs

---

### Enrichment Layer

Indicators are enriched with additional intelligence.

Example flow:

new_indicator  
→ geolocation lookup  
→ abuse score lookup  
→ scanning classification  
→ infrastructure scan  
→ relationship extraction

---

### Storage Layer

PostgreSQL

Stores:

indicators  
metadata  
relationships  
campaigns

Graph database (optional)

Neo4j for infrastructure relationships.

Redis

Used for:

job queues  
enrichment pipelines  
caching

---

### Backend API

Handles:

indicator search  
map data queries  
campaign analysis  
relationship graphs  
real-time feeds

Example endpoints:

/api/indicator/{value}  
/api/indicators/latest  
/api/campaigns  
/api/map  
/api/relationships/{indicator}

Real-time updates delivered via WebSockets.

---

### Frontend Application

Single-page application providing the dashboard.

Primary UI components:

global threat map  
live threat feed  
indicator search  
relationship graph  
campaign explorer

Suggested technologies:

React  
Mapbox GL  
Deck.gl  
Cytoscape

---

## 7. Global Map Logic

The map visualizes infrastructure distribution.

It does not track individuals.

Nodes represent:

malicious IPs  
phishing hosts  
botnet infrastructure  
scanning networks

Nodes are clustered at lower zoom levels.

Node color indicates threat category.

Example categories:

red = malware infrastructure  
orange = phishing  
yellow = scanning  
blue = exposed services

---

## 8. AI Intelligence Layer (optional)

AI can analyze clusters of indicators.

Example output:

"New phishing campaign detected targeting banking users.

15 domains registered within 24 hours.
Hosted on AS14061.
Infrastructure overlaps with previous campaign."

AI summaries appear in campaign pages.

---

## 9. MVP Feature Set

Phase 1

IP reputation explorer  
phishing URL tracker  
global threat map  
indicator search  
live threat feed

Phase 2

relationship graph  
campaign clustering  
historical timelines  
ASN explorer

Phase 3

AI campaign analysis  
public API  
community indicator submission

---

## 10. Scalability Considerations

The system must support millions of indicators.

Strategies include:

indicator deduplication  
incremental feed ingestion  
indexing on IP/domain fields  
relationship caching

---

## 11. Security and Ethics

The platform only aggregates publicly available threat data.

It does not attempt to identify individuals.

The goal is infrastructure analysis and cyber threat awareness.

No active scanning or intrusive activities are performed.

---

## 12. Possible Project Names

DarkGrid

---

## 13. Future Expansion

Possible future capabilities include:

internet scanning visualization  
global vulnerability tracking  
campaign detection AI  
open security research datasets