# Project Type Comparison: Solar vs Street Lighting

Quick reference showing how the same Installation module handles different project types.

## Side-by-Side Comparison

| Aspect | Solar Panel Installation | Street Lighting Installation |
|--------|-------------------------|------------------------------|
| **Customer Type** | Residential/Commercial property owners | Municipal government (City Public Works) |
| **Project Duration** | 1-2 days | 1-4 weeks (phased) |
| **Team Size** | 2-4 technicians | 4-8 crew + crane operators |
| **Typical Events** | 5-6 events | 7-8 events (multi-phase) |
| **Total Photos** | 20-25 photos | 30-40 photos |
| **Report Recipient** | Property owner | City engineer, public works dept |
| **Key Measurements** | kW capacity, voltage, panel count, efficiency | Lux levels, pole spacing, pole count, power consumption |
| **Inspection Required** | Electrical inspection | City engineer inspection, electrical inspection |
| **Project Value** | $15,000 - $50,000 | $50,000 - $500,000+ |

## Workflow Comparison

### Solar Panel Installation (Residential)

```
Day 1: 8 hours
├─ 8:00 AM  Site Inspection (3 photos)
│           → Roof condition, electrical panel, attic access
│
├─ 9:30 AM  Mounting System (4 photos)
│           → Rails, flashings, waterproofing
│
├─ 11:00 AM Panel Installation (3 photos)
│           → 12 panels mounted, wired in series
│
├─ 1:00 PM  Electrical Work (5 photos)
│           → Inverter, disconnects, breaker connection
│
├─ 3:00 PM  System Testing (2 photos)
│           → Power on, production verification
│
└─ 4:00 PM  Customer Handoff (1 photo)
            → App setup, warranty explanation

Total: 18 photos, 1 day, 3-person crew
```

### Street Lighting Installation (Municipal)

```
Week 1: Batch 1 (8 poles)
Day 1
├─ 7:00 AM  Site Survey (5 photos)
│           → Pole locations, utility markings, permits
│
├─ 8:30 AM  Foundation Work (8 photos)
│           → Excavation, rebar, concrete pour (8 poles)
│
├─ 1:00 PM  Pole Erection (6 photos)
│           → Crane setup, pole lifting, alignment
│
├─ 3:00 PM  Fixture Installation (5 photos)
│           → LED mounting, wiring, photocells

Day 2
├─ 9:00 AM  Electrical Connection (4 photos)
│           → Underground conduit, transformer connection
│
└─ 6:00 PM  System Testing (4 photos)
            → Dusk test, lux measurements

Day 3
└─ 10:00 AM City Inspection (3 photos)
            → Engineer sign-off, documentation

Week 2: Batch 2 (7 poles)
└─ [Repeat process for remaining poles]

Total: 35+ photos, 2 weeks, 6-person crew
```

## Data Model Flexibility

The Installation model handles both through the same interface:

```typescript
// Solar Installation
{
  projectType: "solar_installation",
  title: "5kW Residential Solar",
  events: [
    {
      eventType: "site_inspection",
      measurements: {
        roofArea: "520 sqft",
        roofAngle: "30 degrees",
        panelCount: 12,
        systemSize: "4.8kW"
      }
    }
  ]
}

// Street Lighting Installation
{
  projectType: "street_lighting",
  title: "LED Street Lighting - Main Street",
  events: [
    {
      eventType: "site_inspection",
      measurements: {
        streetLength: "1800 feet",
        poleCount: 15,
        spacing: "120 feet",
        luxTarget: "12 lux"
      }
    }
  ]
}
```

## UI Adaptations

### Installation List - Filtered Views

```typescript
// Filter buttons in UI
<div class="filter-buttons">
  <button (click)="filterByType('all')">All Projects</button>
  <button (click)="filterByType('solar_installation')">
    ☀️ Solar Installations
  </button>
  <button (click)="filterByType('street_lighting')">
    💡 Street Lighting
  </button>
</div>

// Different card displays
Solar Card:
┌─────────────────────────────┐
│ ☀️ SOLAR-2025-0143          │
│ 5kW Residential Solar       │
│ Customer: John Smith        │
│ Status: ● Completed         │
│ System: 4.8kW (12 panels)   │
└─────────────────────────────┘

Street Lighting Card:
┌─────────────────────────────┐
│ 💡 LIGHT-2025-0089          │
│ Main Street Phase 2         │
│ Customer: City of Austin    │
│ Status: ● In Progress       │
│ Coverage: 1800 ft (15 poles)│
└─────────────────────────────┘
```

### Event Form - Dynamic Fields

```typescript
// When projectType === 'solar_installation'
Event Measurements:
- Panel Count: [____]
- System Size (kW): [____]
- Voltage: [____] V
- Inverter Model: [____]
- Efficiency: [____] %

// When projectType === 'street_lighting'
Event Measurements:
- Pole Count: [____]
- Pole Height: [____] ft
- Fixture Model: [____]
- Lumens: [____]
- Lux Level: [____]
- Spacing: [____] ft
```

## Report Templates

### Solar Installation Report (PDF)

```
╔══════════════════════════════════════════════════════╗
║     SOLAR PANEL INSTALLATION COMPLETION REPORT       ║
╚══════════════════════════════════════════════════════╝

Project Number: SOLAR-2025-0143
Customer: John Smith
Property: 1234 Oak Street, Austin, TX 78701
Installation Date: January 15, 2025

SYSTEM SPECIFICATIONS
─────────────────────
• System Size: 4.8 kW (12 x 400W panels)
• Inverter: SolarEdge SE5000H (5kW)
• Panel Orientation: South-facing, 30° tilt
• Estimated Annual Production: 7,200 kWh/year
• System Voltage: 240V AC

INSTALLATION TIMELINE
─────────────────────
8:00 AM  ✓ Site Inspection Complete
9:30 AM  ✓ Mounting System Installed
11:00 AM ✓ Solar Panels Mounted
1:00 PM  ✓ Electrical Connections Complete
3:00 PM  ✓ System Testing Passed
4:00 PM  ✓ Customer Handoff

PHOTOGRAPHIC DOCUMENTATION
──────────────────────────
[Photo Grid: 18 photos arranged in timeline order]

TESTING RESULTS
───────────────
✓ System producing 4.2kW at time of commissioning
✓ All safety disconnects functional
✓ Monitoring system activated
✓ Electrical inspection passed

WARRANTY INFORMATION
────────────────────
• Solar Panels: 25-year performance warranty
• Inverter: 12-year manufacturer warranty
• Installation: 10-year workmanship warranty

Customer Signature: _______________  Date: _______
Installer Signature: ______________  Date: _______
```

### Street Lighting Report (PDF)

```
╔══════════════════════════════════════════════════════╗
║   STREET LIGHTING INSTALLATION COMPLETION REPORT     ║
║            CITY OF AUSTIN - PUBLIC WORKS             ║
╚══════════════════════════════════════════════════════╝

Project Number: LIGHT-2025-0089
Project: LED Street Lighting Installation - Main Street Phase 2
Location: Main Street (5th Avenue to 12th Avenue)
Contractor: [Your Company Name]
Project Dates: January 20-27, 2025

PROJECT SUMMARY
───────────────
• Total Street Lights Installed: 15 poles
• Street Coverage: 1,800 linear feet
• Average Pole Spacing: 120 feet
• Project Status: COMPLETED

EQUIPMENT SPECIFICATIONS
────────────────────────
• Pole Type: Valmont 30ft Galvanized Steel
• Fixture Type: Cree XSP-L LED Cobra Head
• Fixture Wattage: 150W per fixture
• Light Output: 18,000 lumens per fixture
• Color Temperature: 4000K (neutral white)
• Photocontrol: Dusk-to-dawn automatic

ELECTRICAL SPECIFICATIONS
──────────────────────────
• System Voltage: 240V AC
• Circuit Breaker: 60A
• Total Power Consumption: 2.25 kW
• Underground Conduit: 1,850 linear feet
• Wire Gauge: 4 AWG copper

INSTALLATION TIMELINE
─────────────────────
Day 1-2   ✓ Site Survey & Pole Locations Marked
Day 3-4   ✓ Foundations Poured (15 poles)
Day 5-6   ✓ Poles Erected (15 poles)
Day 7-8   ✓ LED Fixtures Installed
Day 9     ✓ Electrical Connections Complete
Day 10    ✓ System Testing at Dusk
Day 11    ✓ City Engineer Inspection PASSED

PHOTOGRAPHIC DOCUMENTATION
──────────────────────────
[Photo Grid: 32 photos showing complete installation process]
• Before installation: 3 photos
• Foundation work: 8 photos
• Pole erection: 6 photos
• Fixture installation: 5 photos
• Electrical work: 4 photos
• Testing & commissioning: 4 photos
• Final completion: 2 photos

ILLUMINATION TESTING RESULTS
─────────────────────────────
✓ Average illumination: 12 lux (meets city standard ≥10 lux)
✓ Uniformity ratio: 4:1 (meets standard ≤6:1)
✓ All photocells functional
✓ All fixtures operational (15/15)

INSPECTION RESULTS
──────────────────
✓ Electrical Inspection: PASSED (Jan 25, 2025)
✓ City Engineer Review: APPROVED (Jan 27, 2025)
✓ Public Works Acceptance: ACCEPTED (Jan 27, 2025)

MAINTENANCE NOTES
─────────────────
• LED fixtures rated for 50,000 hours (approx. 12 years)
• Photocontrols should be inspected annually
• Foundation warranty: 25 years
• Fixture warranty: 10 years

Project Manager: _______________  Date: _______
City Engineer: _________________  Date: _______
Public Works Director: _________  Date: _______
```

## Dashboard Metrics

### Project Type Summary Cards

```typescript
// Solar Dashboard
┌─────────────────────────────┐
│ ☀️ Solar Installations      │
├─────────────────────────────┤
│ Active Projects: 12         │
│ Completed This Month: 8     │
│ Total Capacity: 96.5 kW     │
│ Avg. Install Time: 1.2 days │
└─────────────────────────────┘

// Street Lighting Dashboard
┌─────────────────────────────┐
│ 💡 Street Lighting Projects │
├─────────────────────────────┤
│ Active Projects: 3          │
│ Completed This Quarter: 5   │
│ Total Poles Installed: 287  │
│ Total Coverage: 34,440 feet │
└─────────────────────────────┘
```

## Best Practices by Project Type

### Solar Installations

**Photo Requirements:**
- ✅ Before: Roof condition (3 photos)
- ✅ During: Each major step (12-15 photos)
- ✅ After: System operational (2-3 photos)
- ✅ Details: Electrical connections close-ups

**Critical Measurements:**
- System size (kW)
- Panel count
- Voltage
- Inverter specifications
- Estimated annual production

**Report Audience:**
- Property owner (non-technical)
- Use clear explanations
- Emphasize savings and warranties
- Include monitoring app instructions

### Street Lighting Installations

**Photo Requirements:**
- ✅ Before: Site conditions, existing infrastructure
- ✅ During: Foundation work, pole erection, each batch
- ✅ Testing: Daytime and nighttime photos
- ✅ Final: Wide coverage shots showing complete project

**Critical Measurements:**
- Lux levels (illumination)
- Pole spacing
- Total coverage area
- Power consumption
- Fixture specifications

**Report Audience:**
- City engineers (technical)
- Include detailed specifications
- Emphasize code compliance
- Document all inspections and approvals
- Include energy efficiency data

## Summary

**Same System, Different Workflows:**

| Feature | Works For Both |
|---------|----------------|
| Event Timeline | ✅ Flexible event types |
| Photo Documentation | ✅ Unlimited photos per event |
| Team Tracking | ✅ Multiple team members |
| Measurements | ✅ Custom fields per project |
| Status Tracking | ✅ Same status flow |
| Report Generation | ✅ Different templates |

**Key Advantage:** Your team uses ONE system for ALL installation types!

**Extensibility:** Easy to add new project types:
- HVAC installations
- Electrical retrofits
- Generator installations
- EV charging stations
- Whatever your company expands into next

See [MULTI_PROJECT_TYPE_GUIDE.md](MULTI_PROJECT_TYPE_GUIDE.md) for complete implementation details.
