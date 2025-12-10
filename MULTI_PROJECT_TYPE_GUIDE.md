# Multi-Project Type Installation Guide

Your Installation module supports **multiple project types** including both **solar panel installations** and **street lighting installations** for municipal contracts.

## Supported Project Types

```typescript
type ProjectType =
  | 'solar_installation'           // Residential/commercial solar
  | 'solar_maintenance'             // Solar system maintenance
  | 'street_lighting'               // New street light installation
  | 'street_lighting_maintenance'   // Street light repair/replacement
  | 'electrical_work'               // General electrical
  | 'construction'                  // Construction projects
  | 'plumbing' | 'hvac' | 'renovation' | 'other'
```

## Example 1: Solar Panel Installation (Residential)

### Project Overview
```typescript
{
  projectNumber: "SOLAR-2025-0143",
  title: "5kW Residential Solar Installation - Smith Residence",
  projectType: "solar_installation",
  customerId: "customer-456",
  customerName: "John Smith",
  location: {
    address: "1234 Oak Street",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    coordinates: { latitude: 30.2672, longitude: -97.7431 }
  },
  scheduledDate: "2025-01-15T08:00:00Z"
}
```

### Installation Workflow

**Event 1: Site Inspection** (8:00 AM)
```typescript
{
  eventType: "site_inspection",
  title: "Pre-Installation Site Survey",
  description: "Roof inspection completed. All structural conditions meet requirements for 12-panel array.",
  photos: [
    "roof-south-facing.jpg",      // Overall roof condition
    "electrical-panel.jpg",        // Current electrical panel
    "attic-interior.jpg"          // Attic access and rafters
  ],
  measurements: {
    roofArea: "520 sqft",
    roofAngle: "30 degrees",
    roofMaterial: "Asphalt shingles",
    existingPanelAmps: "200A"
  },
  status: "completed"
}
```

**Event 2: Mounting System Installation** (9:30 AM)
```typescript
{
  eventType: "installation",
  title: "Roof Mounting System Installed",
  description: "All mounting rails and flashings installed. Waterproofing complete.",
  photos: [
    "mounting-rails-1.jpg",
    "mounting-rails-2.jpg",
    "flashing-detail.jpg",
    "waterproofing.jpg"
  ],
  measurements: {
    railsInstalled: 4,
    flashingCount: 48,
    roofPenetrations: 48
  },
  status: "completed"
}
```

**Event 3: Panel Installation** (11:00 AM)
```typescript
{
  eventType: "installation",
  title: "Solar Panels Mounted",
  description: "All 12 solar panels (400W each) mounted on south-facing roof section.",
  photos: [
    "panels-array-overview.jpg",
    "panel-connection-detail.jpg",
    "array-complete.jpg"
  ],
  measurements: {
    panelCount: 12,
    panelWattage: "400W",
    totalSystemSize: "4.8kW",
    arrayOrientation: "South",
    tiltAngle: "30 degrees"
  },
  status: "completed"
}
```

**Event 4: Electrical Work** (1:00 PM)
```typescript
{
  eventType: "installation",
  title: "Inverter and Electrical Connections",
  description: "SolarEdge inverter installed. AC/DC disconnects installed. Connected to main panel.",
  photos: [
    "inverter-installation.jpg",
    "dc-disconnect.jpg",
    "ac-disconnect.jpg",
    "breaker-connection.jpg",
    "conduit-run.jpg"
  ],
  measurements: {
    inverterModel: "SolarEdge SE5000H",
    inverterCapacity: "5kW",
    voltage: "240V",
    breakerSize: "25A"
  },
  status: "completed"
}
```

**Event 5: System Testing** (3:00 PM)
```typescript
{
  eventType: "testing",
  title: "System Commissioning and Testing",
  description: "System powered on and tested. All panels producing power. Monitoring activated.",
  photos: [
    "inverter-display.jpg",
    "power-production.jpg",
    "monitoring-app.jpg"
  ],
  measurements: {
    systemVoltage: "240V",
    currentProduction: "4.2kW",
    efficiency: "87.5%",
    gridConnection: "Verified"
  },
  status: "completed"
}
```

**Event 6: Customer Walkthrough** (4:00 PM)
```typescript
{
  eventType: "completion",
  title: "Installation Complete - Customer Handoff",
  description: "System operation explained to homeowner. Monitoring app configured on customer's phone.",
  photos: [
    "final-installation.jpg",
    "customer-with-system.jpg"
  ],
  status: "completed"
}
```

**Total Photos:** 23 photos documenting complete installation

---

## Example 2: Street Lighting Installation (Municipal)

### Project Overview
```typescript
{
  projectNumber: "LIGHT-2025-0089",
  title: "LED Street Lighting Installation - Main Street Phase 2",
  projectType: "street_lighting",
  customerId: "city-austin-001",
  customerName: "City of Austin - Public Works Department",
  location: {
    address: "Main Street (Between 5th & 12th Avenue)",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    coordinates: { latitude: 30.2711, longitude: -97.7437 }
  },
  scheduledDate: "2025-01-20T07:00:00Z"
}
```

### Installation Workflow

**Event 1: Site Survey & Marking** (7:00 AM)
```typescript
{
  eventType: "site_inspection",
  title: "Site Survey and Pole Locations Marked",
  description: "All 15 pole locations marked and verified with city engineer. Underground utilities located.",
  photos: [
    "street-overview.jpg",
    "pole-location-1.jpg",
    "pole-location-5.jpg",
    "pole-location-10.jpg",
    "utility-markings.jpg"
  ],
  measurements: {
    totalPoles: 15,
    spacing: "120 feet",
    poleHeight: "30 feet",
    streetLength: "1800 feet"
  },
  status: "completed"
}
```

**Event 2: Foundation & Pole Installation** (8:30 AM - 12:00 PM)
```typescript
{
  eventType: "installation",
  title: "Pole Foundations and Erection - Batch 1",
  description: "First 8 poles installed. Foundations poured and poles erected.",
  photos: [
    "foundation-excavation.jpg",
    "rebar-installation.jpg",
    "concrete-pour.jpg",
    "pole-delivery.jpg",
    "crane-setup.jpg",
    "pole-erection-1.jpg",
    "pole-erection-2.jpg",
    "pole-alignment.jpg"
  ],
  measurements: {
    polesInstalled: 8,
    foundationDepth: "6 feet",
    concreteVolume: "12 cubic yards",
    poleModel: "Valmont 30ft Steel"
  },
  status: "completed"
}
```

**Event 3: LED Fixture Installation** (1:00 PM - 3:00 PM)
```typescript
{
  eventType: "installation",
  title: "LED Fixtures Mounted - Batch 1",
  description: "LED cobra-head fixtures installed on first 8 poles. Wiring completed.",
  photos: [
    "fixture-mounting-1.jpg",
    "fixture-mounting-2.jpg",
    "wiring-connection.jpg",
    "fixture-alignment.jpg",
    "photocell-installation.jpg"
  ],
  measurements: {
    fixturesInstalled: 8,
    fixtureModel: "Cree XSP-L 150W LED",
    lumens: "18000 lm",
    colorTemp: "4000K",
    photocellType: "Dusk-to-dawn"
  },
  status: "completed"
}
```

**Event 4: Electrical Connection** (3:30 PM)
```typescript
{
  eventType: "installation",
  title: "Underground Electrical Connections",
  description: "Underground conduit and wiring completed. Connected to city power grid at transformer.",
  photos: [
    "trench-excavation.jpg",
    "conduit-installation.jpg",
    "transformer-connection.jpg",
    "junction-box.jpg"
  ],
  measurements: {
    conduitLength: "1850 feet",
    wireGauge: "4 AWG",
    voltage: "240V",
    circuitBreaker: "60A"
  },
  status: "completed"
}
```

**Event 5: System Testing & Commissioning** (Next Day - 6:00 PM)
```typescript
{
  eventType: "testing",
  title: "Full System Test at Dusk",
  description: "All 8 lights tested and operational. Photocells functioning correctly. Light levels measured.",
  photos: [
    "lights-on-overview.jpg",
    "light-coverage-1.jpg",
    "light-coverage-2.jpg",
    "lux-meter-reading.jpg"
  ],
  measurements: {
    lightsOperational: "8/8",
    averageLuxLevel: "12 lux",
    powerConsumption: "1.2 kW total",
    photocontrolStatus: "All functional"
  },
  status: "completed"
}
```

**Event 6: City Inspection & Sign-off** (Following Day)
```typescript
{
  eventType: "quality_check",
  title: "City Engineer Inspection Passed",
  description: "City engineer completed inspection. All work approved. Phase 2 complete.",
  photos: [
    "inspection-certificate.jpg",
    "final-installation-daylight.jpg",
    "final-installation-night.jpg"
  ],
  status: "completed"
}
```

**Event 7: Phase 2 Continuation** (Week 2)
```typescript
{
  eventType: "installation",
  title: "Remaining 7 Poles Installed",
  description: "Second batch: 7 additional poles completed to finish Main Street coverage.",
  photos: [
    "poles-9-15-overview.jpg",
    "final-pole-installation.jpg"
  ],
  measurements: {
    totalPolesPhase2: 15,
    projectComplete: "100%"
  },
  status: "completed"
}
```

**Event 8: Project Completion** (Week 2 - End)
```typescript
{
  eventType: "completion",
  title: "Main Street Phase 2 Complete",
  description: "All 15 LED street lights installed and operational. Project handed over to city maintenance.",
  photos: [
    "complete-street-night.jpg",
    "complete-street-day.jpg",
    "city-handoff-meeting.jpg"
  ],
  summary: "Successfully installed 15 LED street lights on Main Street covering 1800 feet. All lights operational and meeting city illumination standards.",
  status: "completed"
}
```

**Total Photos:** 32+ photos documenting municipal project

---

## Key Differences Between Project Types

### Solar Installation
- **Customer Type:** Residential, commercial
- **Duration:** 1-2 days
- **Team Size:** 2-4 technicians
- **Key Measurements:** kW capacity, voltage, panel count
- **Report Recipient:** Property owner
- **Photos Focus:** Roof work, electrical, system performance

### Street Lighting
- **Customer Type:** Municipal government
- **Duration:** 1-4 weeks (multiple phases)
- **Team Size:** 4-8 crew members + crane operators
- **Key Measurements:** Lux levels, pole spacing, power consumption
- **Report Recipient:** City engineer, public works department
- **Photos Focus:** Site work, pole installation, coverage testing

---

## Implementation in Your UI

### Installation Create Form

```typescript
// installation-create.component.ts
readonly projectTypeOptions = [
  {
    value: 'solar_installation',
    label: 'Solar Panel Installation',
    icon: '☀️'
  },
  {
    value: 'solar_maintenance',
    label: 'Solar System Maintenance',
    icon: '🔧'
  },
  {
    value: 'street_lighting',
    label: 'Street Lighting Installation',
    icon: '💡'
  },
  {
    value: 'street_lighting_maintenance',
    label: 'Street Light Maintenance',
    icon: '🔨'
  },
  // ... other types
];
```

### Dynamic Event Type Suggestions

```typescript
// Based on project type, suggest relevant event types
getRecommendedEventTypes(projectType: ProjectType): EventType[] {
  switch (projectType) {
    case 'solar_installation':
      return [
        'site_inspection',
        'preparation',      // Roof prep
        'installation',     // Mounting & panels
        'installation',     // Electrical
        'testing',         // System commissioning
        'completion'       // Customer handoff
      ];

    case 'street_lighting':
      return [
        'site_inspection',
        'preparation',      // Site marking, utilities
        'installation',     // Foundations
        'installation',     // Pole erection
        'installation',     // Fixture mounting
        'installation',     // Electrical
        'testing',         // Light testing
        'quality_check',   // City inspection
        'completion'
      ];

    default:
      return ['site_inspection', 'installation', 'testing', 'completion'];
  }
}
```

### Project-Specific Templates

```typescript
// installation-detail.component.ts
getMeasurementTemplate(projectType: ProjectType): string[] {
  switch (projectType) {
    case 'solar_installation':
      return [
        'panelCount',
        'systemSize (kW)',
        'voltage',
        'inverterModel',
        'efficiency (%)'
      ];

    case 'street_lighting':
      return [
        'poleCount',
        'poleHeight (ft)',
        'fixtureModel',
        'lumens',
        'luxLevel',
        'spacing (ft)',
        'powerConsumption (kW)'
      ];

    default:
      return [];
  }
}
```

---

## Report Generation

### Solar Installation Report
```
Project: 5kW Residential Solar Installation
Customer: John Smith
Date: January 15, 2025
Location: 1234 Oak Street, Austin, TX

INSTALLATION SUMMARY:
- System Size: 4.8kW (12 x 400W panels)
- Inverter: SolarEdge SE5000H
- Estimated Annual Production: 7,200 kWh
- Installation Time: 8 hours
- Team: 3 technicians

PHOTOGRAPHIC DOCUMENTATION:
[23 photos showing roof prep → mounting → panels → electrical → testing]

SYSTEM SPECIFICATIONS:
- Voltage: 240V
- Panel Orientation: South-facing, 30° tilt
- Monitoring: SolarEdge app activated
- Warranty: 25-year panel warranty, 12-year inverter

Customer Signature: _____________
```

### Street Lighting Report
```
Project: LED Street Lighting Installation - Main Street Phase 2
Customer: City of Austin - Public Works Department
Date: January 20-27, 2025
Location: Main Street (5th-12th Avenue)

PROJECT SUMMARY:
- Total Poles Installed: 15
- Pole Type: Valmont 30ft Steel
- Fixtures: Cree XSP-L 150W LED (18,000 lumens)
- Street Coverage: 1,800 feet
- Average Illumination: 12 lux (meets city standard)

PHOTOGRAPHIC DOCUMENTATION:
[32+ photos showing survey → foundations → poles → fixtures → testing → final]

TECHNICAL SPECIFICATIONS:
- Spacing: 120 feet between poles
- Power: 240V, 60A circuit
- Total Power Consumption: 2.25 kW
- Photocell: Dusk-to-dawn automatic
- Conduit: 1,850 feet underground

INSPECTION RESULTS:
✓ City Engineer Inspection - PASSED
✓ Electrical Inspection - PASSED
✓ Illumination Testing - MEETS STANDARDS

Project Manager: _____________
City Engineer: _____________
Date Accepted: _____________
```

---

## Database Filtering & Reports

### Filter Installations by Type

```typescript
// installation-list.component.ts
filterByProjectType(type: ProjectType | 'all'): void {
  if (type === 'all') {
    this.filteredInstallations$ = this.store.installations$;
  } else {
    this.filteredInstallations$ = this.store.installations$.pipe(
      map(installations =>
        installations.filter(inst => inst.projectType === type)
      )
    );
  }
}
```

### Dashboard Metrics

```typescript
// Calculate metrics by project type
getSolarMetrics(): Observable<SolarMetrics> {
  return this.store.installations$.pipe(
    map(installations => {
      const solarProjects = installations.filter(
        i => i.projectType === 'solar_installation' && i.status === 'completed'
      );

      return {
        totalProjects: solarProjects.length,
        totalCapacity: solarProjects.reduce((sum, p) => {
          // Parse kW from measurements
          return sum + this.extractSystemSize(p);
        }, 0),
        avgInstallTime: this.calculateAvgDuration(solarProjects)
      };
    })
  );
}

getStreetLightingMetrics(): Observable<LightingMetrics> {
  return this.store.installations$.pipe(
    map(installations => {
      const lightingProjects = installations.filter(
        i => i.projectType === 'street_lighting' && i.status === 'completed'
      );

      return {
        totalProjects: lightingProjects.length,
        totalPoles: lightingProjects.reduce((sum, p) => {
          return sum + this.extractPoleCount(p);
        }, 0),
        totalStreetCoverage: this.calculateTotalFeet(lightingProjects)
      };
    })
  );
}
```

---

## Summary

Your Installation module now supports:

✅ **Solar Panel Installations** - Residential & commercial
✅ **Street Lighting Projects** - Municipal contracts
✅ **Multiple Event Types** - Flexible workflow for any project
✅ **Photo Documentation** - Unlimited photos per event
✅ **Custom Measurements** - Project-specific data fields
✅ **Different Report Formats** - Tailored to customer type

**Same Components, Different Use Cases:**
- Installation List → Filter by project type
- Installation Detail → Same UI, different event templates
- Installation Report → Project-type specific formatting
- Event Logging → Customized measurement fields

The system is **fully extensible** - you can add more project types anytime without changing the core architecture!
