// In-memory persistent data store with realistic Indian Insurance & Finance records

let users = [
  {
    id: "usr-admin-1",
    name: "Vikramaditya Singhania",
    email: "admin@aegis.in",
    password: "admin123",
    role: "admin",
    designation: "Chief Risk Officer & Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-staff-1",
    name: "Ananya Deshmukh",
    email: "staff@aegis.in",
    password: "staff123",
    role: "staff",
    designation: "Senior Underwriter & Claims Officer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-client-1",
    customerId: "cust-101",
    name: "Pooja Sharma",
    email: "client@aegis.in",
    password: "client123",
    role: "client",
    designation: "Privilege Policyholder",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

let customers = [
  {
    id: "cust-101",
    name: "Pooja Sharma",
    email: "client@aegis.in",
    phone: "+91 98201 44821",
    address: "A-402 Raheja Atlantis, Bandra West, Mumbai, MH",
    creditScore: 785,
    riskRating: "Low",
    kycStatus: "Verified",
    occupation: "VP of Engineering, FinTech",
    annualIncome: 3600000, // ₹36 Lakhs
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2023-03-15"
  },
  {
    id: "cust-102",
    name: "Rajesh Malhotra",
    email: "rajesh.malhotra@zenithcorp.in",
    phone: "+91 98112 55902",
    address: "Villa 14, Palm Meadows, Whitefield, Bengaluru, KA",
    creditScore: 810,
    riskRating: "Low",
    kycStatus: "Verified",
    occupation: "Managing Director, Exports",
    annualIncome: 6500000, // ₹65 Lakhs
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2022-11-04"
  },
  {
    id: "cust-103",
    name: "Dr. Kavita Narayanan",
    email: "kavita.narayanan@apollo.org",
    phone: "+91 94440 12890",
    address: "72 Boat Club Road, R.A. Puram, Chennai, TN",
    creditScore: 790,
    riskRating: "Low",
    kycStatus: "Verified",
    occupation: "Chief Cardiac Surgeon",
    annualIncome: 4800000, // ₹48 Lakhs
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2024-01-20"
  },
  {
    id: "cust-104",
    name: "Arjun Verma",
    email: "arjun.verma@techwave.io",
    phone: "+91 98710 33411",
    address: "Flat 901, DLF Phase 5, Gurugram, HR",
    creditScore: 660,
    riskRating: "Medium",
    kycStatus: "Pending",
    occupation: "Lead Product Manager",
    annualIncome: 2400000, // ₹24 Lakhs
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2024-06-11"
  },
  {
    id: "cust-105",
    name: "Sunita Reddy",
    email: "sunita.reddy@hyderabadbiotech.com",
    phone: "+91 99890 66723",
    address: "Road No. 36, Jubilee Hills, Hyderabad, TS",
    creditScore: 740,
    riskRating: "Low",
    kycStatus: "Verified",
    occupation: "Clinical Trials Director",
    annualIncome: 3200000, // ₹32 Lakhs
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2023-08-19"
  },
  {
    id: "cust-106",
    name: "Sameer Kulkarni",
    email: "sameer.k@logipower.in",
    phone: "+91 98220 99182",
    address: "Plot 42, Baner Pashan Link Rd, Pune, MH",
    creditScore: 620,
    riskRating: "High",
    kycStatus: "Action Required",
    occupation: "Fleet Logistics Operator",
    annualIncome: 1500000, // ₹15 Lakhs
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    joinedDate: "2024-08-01"
  }
];

let policies = [
  {
    id: "pol-1001",
    policyNumber: "POL-HLT-2024-8841",
    customerId: "cust-101",
    customerName: "Pooja Sharma",
    category: "Health",
    planName: "Aegis Diamond Health Shield (Cashless)",
    coverageAmount: 5000000, // ₹50 Lakhs
    deductible: 25000,       // ₹25,000
    premiumAmount: 4200,     // ₹4,200 / Month
    paymentFrequency: "Monthly",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    status: "Active",
    nominee: "Rohan Sharma (Spouse)",
    riskScore: 18,
    terms: "Cashless across 12,000+ pan-India network hospitals. Zero co-pay, organ donor cover, and global OPD rider."
  },
  {
    id: "pol-1002",
    policyNumber: "POL-AUT-2024-9120",
    customerId: "cust-102",
    customerName: "Rajesh Malhotra",
    category: "Auto",
    planName: "Prestige Motor Bumper-to-Bumper Shield",
    coverageAmount: 4500000, // ₹45 Lakhs IDV (BMW 5 Series)
    deductible: 10000,       // ₹10,000
    premiumAmount: 68500,    // ₹68,500 / Year
    paymentFrequency: "Annual",
    startDate: "2024-02-15",
    endDate: "2025-02-15",
    status: "Active",
    nominee: "Geeta Malhotra (Wife)",
    riskScore: 15,
    terms: "Zero depreciation, engine & gearbox protector, 24x7 pan-India roadside assistance, tyre replacement."
  },
  {
    id: "pol-1003",
    policyNumber: "POL-LIF-2023-4412",
    customerId: "cust-102",
    customerName: "Rajesh Malhotra",
    category: "Life",
    planName: "Aegis Sovereign Term Life 35-Year",
    coverageAmount: 20000000, // ₹2 Crores
    deductible: 0,
    premiumAmount: 3400,      // ₹3,400 / Month
    paymentFrequency: "Monthly",
    startDate: "2023-01-10",
    endDate: "2058-01-10",
    status: "Active",
    nominee: "Malhotra Family Trust",
    riskScore: 12,
    terms: "Pure term plan with 100% tax benefit u/s 80C & 10(10D). Terminal illness immediate 50% payout."
  },
  {
    id: "pol-1004",
    policyNumber: "POL-PRP-2024-3011",
    customerId: "cust-103",
    customerName: "Dr. Kavita Narayanan",
    category: "Property",
    planName: "Apex Griha Raksha Villa & Home Policy",
    coverageAmount: 15000000, // ₹1.5 Crores
    deductible: 50000,        // ₹50,000
    premiumAmount: 32000,     // ₹32,000 / Year
    paymentFrequency: "Annual",
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    status: "Active",
    nominee: "Dr. S. Narayanan (Husband)",
    riskScore: 24,
    terms: "Dwelling replacement cost, artwork, jewellery up to ₹25L, earthquake and cyclone hazard cover."
  },
  {
    id: "pol-1005",
    policyNumber: "POL-AUT-2024-1188",
    customerId: "cust-104",
    customerName: "Arjun Verma",
    category: "Auto",
    planName: "Smart Drive Comprehensive Auto Guard",
    coverageAmount: 1800000, // ₹18 Lakhs IDV (Hyundai Ioniq)
    deductible: 5000,
    premiumAmount: 2800,     // ₹2,800 / Month
    paymentFrequency: "Monthly",
    startDate: "2024-06-15",
    endDate: "2025-06-15",
    status: "Grace Period",
    nominee: "Ritu Verma (Mother)",
    riskScore: 48,
    terms: "Battery shield for EV, comprehensive third party plus own damage insurance."
  },
  {
    id: "pol-1006",
    policyNumber: "POL-HLT-2023-7729",
    customerId: "cust-105",
    customerName: "Sunita Reddy",
    category: "Health",
    planName: "Executive Family Floater Health",
    coverageAmount: 2500000, // ₹25 Lakhs
    deductible: 15000,
    premiumAmount: 5600,     // ₹5,600 / Month
    paymentFrequency: "Monthly",
    startDate: "2023-09-01",
    endDate: "2024-09-01",
    status: "Expiring Soon",
    nominee: "Prashanth Reddy (Spouse)",
    riskScore: 16,
    terms: "Maternity cover up to ₹1,00,000, AYUSH inpatient treatment, restoration benefit 100%."
  },
  {
    id: "pol-1007",
    policyNumber: "POL-COM-2024-5501",
    customerId: "cust-106",
    customerName: "Sameer Kulkarni",
    category: "Commercial",
    planName: "Bharat Udyog Commercial Transit & Fire",
    coverageAmount: 7500000, // ₹75 Lakhs
    deductible: 100000,
    premiumAmount: 48000,    // ₹48,000 / Year
    paymentFrequency: "Annual",
    startDate: "2024-08-05",
    endDate: "2025-08-05",
    status: "Under Review",
    nominee: "LogiPower Transways LLP",
    riskScore: 65,
    terms: "Commercial warehouse fire, in-transit cargo loss, third party commercial liabilities."
  }
];

let payments = [
  {
    id: "pmt-801",
    invoiceNumber: "INV-2024-0801",
    policyId: "pol-1001",
    policyNumber: "POL-HLT-2024-8841",
    customerId: "cust-101",
    customerName: "Pooja Sharma",
    amount: 4200,
    dueDate: "2024-09-01",
    paidDate: "2024-08-30",
    paymentMethod: "UPI (Google Pay / pooja@oksbi)",
    status: "Paid",
    transactionRef: "UPI-428901248901"
  },
  {
    id: "pmt-802",
    invoiceNumber: "INV-2024-0802",
    policyId: "pol-1002",
    policyNumber: "POL-AUT-2024-9120",
    customerId: "cust-102",
    customerName: "Rajesh Malhotra",
    amount: 68500,
    dueDate: "2024-02-15",
    paidDate: "2024-02-14",
    paymentMethod: "NetBanking (HDFC Corporate)",
    status: "Paid",
    transactionRef: "HDFC-8812739023"
  },
  {
    id: "pmt-803",
    invoiceNumber: "INV-2024-0803",
    policyId: "pol-1003",
    policyNumber: "POL-LIF-2023-4412",
    customerId: "cust-102",
    customerName: "Rajesh Malhotra",
    amount: 3400,
    dueDate: "2024-09-10",
    paidDate: "2024-09-08",
    paymentMethod: "Auto-Debit NACH Mandate",
    status: "Paid",
    transactionRef: "NACH-773419910"
  },
  {
    id: "pmt-804",
    invoiceNumber: "INV-2024-0804",
    policyId: "pol-1004",
    policyNumber: "POL-PRP-2024-3011",
    customerId: "cust-103",
    customerName: "Dr. Kavita Narayanan",
    amount: 32000,
    dueDate: "2024-03-01",
    paidDate: "2024-03-01",
    paymentMethod: "RuPay Credit Card (••• 8812)",
    status: "Paid",
    transactionRef: "RUPAY-662990141"
  },
  {
    id: "pmt-805",
    invoiceNumber: "INV-2024-0805",
    policyId: "pol-1005",
    policyNumber: "POL-AUT-2024-1188",
    customerId: "cust-104",
    customerName: "Arjun Verma",
    amount: 2800,
    dueDate: "2024-09-15",
    paidDate: null,
    paymentMethod: "Pending Selection",
    status: "Pending",
    transactionRef: null
  },
  {
    id: "pmt-806",
    invoiceNumber: "INV-2024-0806",
    policyId: "pol-1006",
    policyNumber: "POL-HLT-2023-7729",
    customerId: "cust-105",
    customerName: "Sunita Reddy",
    amount: 5600,
    dueDate: "2024-09-01",
    paidDate: "2024-09-01",
    paymentMethod: "UPI (PhonePe / sunita@ybl)",
    status: "Paid",
    transactionRef: "UPI-5541098234"
  },
  {
    id: "pmt-807",
    invoiceNumber: "INV-2024-0807",
    policyId: "pol-1001",
    policyNumber: "POL-HLT-2024-8841",
    customerId: "cust-101",
    customerName: "Pooja Sharma",
    amount: 4200,
    dueDate: "2024-10-01",
    paidDate: null,
    paymentMethod: "Auto-Debit Scheduled",
    status: "Pending",
    transactionRef: null
  }
];

let claims = [
  {
    id: "clm-301",
    claimNumber: "CLM-2024-00301",
    policyId: "pol-1002",
    policyNumber: "POL-AUT-2024-9120",
    customerId: "cust-102",
    customerName: "Rajesh Malhotra",
    category: "Auto",
    incidentDate: "2024-07-22",
    filedDate: "2024-07-24",
    claimAmount: 85000,    // ₹85,000
    approvedAmount: 75000, // ₹75,000
    description: "Front bumper, matrix LED headlight and sensor damage in basement parking at UB City Bengaluru. CCTV footage and authorized BMW workshop estimate attached.",
    incidentLocation: "UB City Basement Level 2, Vittal Mallya Rd, Bengaluru",
    evidencePhotos: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80"
    ],
    status: "Settled",
    adjusterNotes: "Surveyed by Adjuster R. Kulkarni. BMW Navnit Motors repair invoice verified. Zero depreciation applicable with ₹10,000 voluntary deductible deduction.",
    adjusterName: "Ananya Deshmukh, Senior Claims Officer",
    settlementDate: "2024-08-05"
  },
  {
    id: "clm-302",
    claimNumber: "CLM-2024-00302",
    policyId: "pol-1004",
    policyNumber: "POL-PRP-2024-3011",
    customerId: "cust-103",
    customerName: "Dr. Kavita Narayanan",
    category: "Property",
    incidentDate: "2024-08-14",
    filedDate: "2024-08-16",
    claimAmount: 220000,   // ₹2,20,000
    approvedAmount: null,
    description: "Overhead solar water heater valve burst causing false ceiling collapse and Italian marble erosion in upper floor guest suite during Chennai monsoon.",
    incidentLocation: "72 Boat Club Road, R.A. Puram, Chennai",
    evidencePhotos: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80"
    ],
    status: "Under Review",
    adjusterNotes: "Independent civil surveyor dispatched. Awaiting structural moisture assessment report and repair estimates from Godrej Interio.",
    adjusterName: "Ananya Deshmukh, Senior Claims Officer",
    settlementDate: null
  },
  {
    id: "clm-303",
    claimNumber: "CLM-2024-00303",
    policyId: "pol-1001",
    policyNumber: "POL-HLT-2024-8841",
    customerId: "cust-101",
    customerName: "Pooja Sharma",
    category: "Health",
    incidentDate: "2024-08-28",
    filedDate: "2024-08-30",
    claimAmount: 48500,    // ₹48,500
    approvedAmount: null,
    description: "Post-operative follow-up and specialized Doppler imaging following laparoscopic gall bladder treatment at Lilavati Hospital Mumbai.",
    incidentLocation: "Lilavati Hospital & Research Centre, Bandra West, Mumbai",
    evidencePhotos: [
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80"
    ],
    status: "Submitted",
    adjusterNotes: "Awaiting final discharge summary and TPA pre-authorization settlement clearance.",
    adjusterName: "Unassigned",
    settlementDate: null
  },
  {
    id: "clm-304",
    claimNumber: "CLM-2024-00304",
    policyId: "pol-1005",
    policyNumber: "POL-AUT-2024-1188",
    customerId: "cust-104",
    customerName: "Arjun Verma",
    category: "Auto",
    incidentDate: "2024-06-20",
    filedDate: "2024-06-22",
    claimAmount: 35000,
    approvedAmount: 0,
    description: "Windshield glass crack reported on Delhi-Gurgaon Expressway. Inspection revealed pre-existing fracture recorded during previous policy term.",
    incidentLocation: "Cyber Hub flyover, Gurugram",
    evidencePhotos: [],
    status: "Rejected",
    adjusterNotes: "Digital photograph forensics revealed fracture origin predates policy inception. Formal declination letter issued under Exclusion Clause 3(C).",
    adjusterName: "Ananya Deshmukh, Senior Claims Officer",
    settlementDate: "2024-07-02"
  }
];

let ledger = [
  {
    id: "led-01",
    date: "2024-02-14",
    type: "INFLOW",
    category: "Premium Payment",
    description: "Annual Premium: POL-AUT-2024-9120 (Rajesh Malhotra)",
    amount: 68500,
    referenceId: "pmt-802",
    balanceAfter: 68500
  },
  {
    id: "led-02",
    date: "2024-03-01",
    type: "INFLOW",
    category: "Premium Payment",
    description: "Annual Premium: POL-PRP-2024-3011 (Dr. Kavita Narayanan)",
    amount: 32000,
    referenceId: "pmt-804",
    balanceAfter: 100500
  },
  {
    id: "led-03",
    date: "2024-08-05",
    type: "OUTFLOW",
    category: "Claim Settlement",
    description: "Claim Payout Settlement: CLM-2024-00301 (Rajesh Malhotra)",
    amount: 75000,
    referenceId: "clm-301",
    balanceAfter: 25500
  },
  {
    id: "led-04",
    date: "2024-08-30",
    type: "INFLOW",
    category: "Premium Payment",
    description: "Monthly Premium: POL-HLT-2024-8841 (Pooja Sharma)",
    amount: 4200,
    referenceId: "pmt-801",
    balanceAfter: 29700
  },
  {
    id: "led-05",
    date: "2024-09-01",
    type: "INFLOW",
    category: "Premium Payment",
    description: "Monthly Premium: POL-HLT-2023-7729 (Sunita Reddy)",
    amount: 5600,
    referenceId: "pmt-806",
    balanceAfter: 35300
  },
  {
    id: "led-06",
    date: "2024-09-08",
    type: "INFLOW",
    category: "Premium Payment",
    description: "Monthly Premium: POL-LIF-2023-4412 (Rajesh Malhotra)",
    amount: 3400,
    referenceId: "pmt-803",
    balanceAfter: 38700
  }
];

export const db = {
  users,
  customers,
  policies,
  payments,
  claims,
  ledger
};
