import { Breach } from "./types";

export const historicalBreaches: Breach[] = [
  {
    id: "equifax-2017",
    name: "Equifax Data Breach",
    date: "2017-09-07",
    affectedOrganization: "Equifax",
    recordsCompromised: 147000000,
    description: "One of the largest data breaches in history. Hackers exploited a vulnerability in Apache Struts (CVE-2017-5638) to access sensitive information of 147 million people including SSNs, birth dates, and addresses.",
    type: ["Data Breach", "Identity Theft"],
    severity: "CRITICAL",
    sources: [
      "https://www.equifaxsecurity2017.com/",
      "https://nvd.nist.gov/vuln/detail/CVE-2017-5638",
    ],
  },
  {
    id: "yahoo-2013",
    name: "Yahoo Data Breach",
    date: "2013-08-01",
    affectedOrganization: "Yahoo",
    recordsCompromised: 3000000000,
    description: "The largest data breach ever recorded. All 3 billion Yahoo accounts were compromised, exposing names, email addresses, phone numbers, dates of birth, and hashed passwords.",
    type: ["Data Breach", "Account Compromise"],
    severity: "CRITICAL",
    sources: [
      "https://www.yahoo.com/",
    ],
  },
  {
    id: "marriott-2018",
    name: "Marriott-Starwood Breach",
    date: "2018-11-30",
    affectedOrganization: "Marriott International",
    recordsCompromised: 500000000,
    description: "Unauthorized access to Starwood guest reservation database. Compromised information included names, addresses, passport numbers, and payment card information.",
    type: ["Data Breach", "Hospitality"],
    severity: "CRITICAL",
    sources: [
      "https://www.marriott.com/",
    ],
  },
  {
    id: "solarwinds-2020",
    name: "SolarWinds Supply Chain Attack",
    date: "2020-12-13",
    affectedOrganization: "SolarWinds / Multiple US Government Agencies",
    recordsCompromised: 18000,
    description: "Sophisticated supply chain attack where threat actors compromised SolarWinds Orion software updates, affecting numerous US government agencies and Fortune 500 companies. Considered one of the most significant cyberattacks in history.",
    type: ["Supply Chain", "APT", "Espionage"],
    severity: "CRITICAL",
    sources: [
      "https://www.solarwinds.com/",
      "https://www.cisa.gov/",
    ],
  },
  {
    id: "colonial-pipeline-2021",
    name: "Colonial Pipeline Ransomware",
    date: "2021-05-07",
    affectedOrganization: "Colonial Pipeline",
    recordsCompromised: 0,
    description: "DarkSide ransomware attack that forced the shutdown of the largest fuel pipeline in the US, causing widespread fuel shortages. The company paid approximately $4.4 million in ransom.",
    type: ["Ransomware", "Critical Infrastructure"],
    severity: "CRITICAL",
    sources: [
      "https://www.colpipe.com/",
    ],
  },
  {
    id: "target-2013",
    name: "Target Point-of-Sale Breach",
    date: "2013-12-19",
    affectedOrganization: "Target Corporation",
    recordsCompromised: 110000000,
    description: "Attackers stole credit and debit card information of 40 million customers and personal information of 70 million additional customers through compromised POS systems.",
    type: ["Data Breach", "Payment Card", "Retail"],
    severity: "HIGH",
    sources: [
      "https://corporate.target.com/",
    ],
  },
  {
    id: "wannacry-2017",
    name: "WannaCry Ransomware",
    date: "2017-05-12",
    affectedOrganization: "Global - 200,000+ victims",
    recordsCompromised: 200000,
    description: "Worldwide ransomware cryptoworm attack exploiting EternalBlue (CVE-2017-0144). Affected over 200,000 computers across 150 countries, including the UK's NHS, causing major disruptions.",
    type: ["Ransomware", "Worm", "Global"],
    severity: "CRITICAL",
    sources: [
      "https://nvd.nist.gov/vuln/detail/CVE-2017-0144",
    ],
  },
  {
    id: "notpetya-2017",
    name: "NotPetya Cyberattack",
    date: "2017-06-27",
    affectedOrganization: "Global - Multiple corporations",
    recordsCompromised: 0,
    description: "Devastating wiper malware disguised as ransomware, initially targeting Ukraine but spreading globally. Caused over $10 billion in damages, affecting companies like Maersk, FedEx, and Merck.",
    type: ["Wiper", "APT", "Cyberwarfare"],
    severity: "CRITICAL",
    sources: [
      "https://www.cisa.gov/",
    ],
  },
  {
    id: "log4shell-2021",
    name: "Log4Shell (Log4j)",
    date: "2021-12-09",
    affectedOrganization: "Global - Millions of systems",
    recordsCompromised: 0,
    description: "Critical zero-day vulnerability (CVE-2021-44228) in Apache Log4j, one of the most widely used logging libraries. Allowed remote code execution and affected millions of applications worldwide.",
    type: ["Zero-Day", "Remote Code Execution", "Global"],
    severity: "CRITICAL",
    sources: [
      "https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
    ],
  },
  {
    id: "facebook-2019",
    name: "Facebook Data Exposure",
    date: "2019-04-03",
    affectedOrganization: "Facebook",
    recordsCompromised: 533000000,
    description: "Personal data of 533 million Facebook users leaked online, including phone numbers, Facebook IDs, names, and locations from 106 countries.",
    type: ["Data Exposure", "Social Media"],
    severity: "HIGH",
    sources: [
      "https://www.facebook.com/",
    ],
  },
  {
    id: "uber-2016",
    name: "Uber Data Breach",
    date: "2016-11-01",
    affectedOrganization: "Uber Technologies",
    recordsCompromised: 57000000,
    description: "Hackers accessed personal information of 57 million Uber users and drivers. The company controversially paid hackers $100,000 to delete the data and kept the breach secret for a year.",
    type: ["Data Breach", "Cover-up"],
    severity: "HIGH",
    sources: [
      "https://www.uber.com/",
    ],
  },
  {
    id: "mgi-2019",
    name: "First American Financial Corp Leak",
    date: "2019-05-24",
    affectedOrganization: "First American Financial Corporation",
    recordsCompromised: 885000000,
    description: "Web application vulnerability exposed 885 million files containing sensitive financial data and personal information dating back to 2003, including bank account numbers and SSNs.",
    type: ["Data Exposure", "Financial"],
    severity: "CRITICAL",
    sources: [],
  },
  {
    id: "cambrid-analytica-2018",
    name: "Cambridge Analytica Scandal",
    date: "2018-03-17",
    affectedOrganization: "Facebook / Cambridge Analytica",
    recordsCompromised: 87000000,
    description: "Political consulting firm Cambridge Analytica harvested personal data of millions of Facebook users without consent for political advertising purposes.",
    type: ["Data Misuse", "Privacy Violation"],
    severity: "HIGH",
    sources: [
      "https://www.facebook.com/",
    ],
  },
  {
    id: "microsoft-exchange-2021",
    name: "Microsoft Exchange Server Attacks",
    date: "2021-03-02",
    affectedOrganization: "Microsoft Exchange Users Globally",
    recordsCompromised: 250000,
    description: "Zero-day vulnerabilities in Microsoft Exchange Server exploited by threat actor Hafnium. Affected at least 250,000 servers worldwide with widespread data theft and ransomware deployment.",
    type: ["Zero-Day", "APT", "Email Server"],
    severity: "CRITICAL",
    sources: [
      "https://www.microsoft.com/",
    ],
  },
  {
    id: "moveit-2023",
    name: "MOVEit Transfer Vulnerability",
    date: "2023-05-31",
    affectedOrganization: "Multiple organizations globally",
    recordsCompromised: 77000000,
    description: "SQL injection vulnerability (CVE-2023-34362) in Progress Software's MOVEit Transfer exploited by Cl0p ransomware gang, affecting numerous organizations including government agencies.",
    type: ["SQL Injection", "Ransomware", "Data Theft"],
    severity: "CRITICAL",
    sources: [
      "https://nvd.nist.gov/vuln/detail/CVE-2023-34362",
    ],
  },
];

export function getBreachesByYear(): Record<string, Breach[]> {
  const grouped: Record<string, Breach[]> = {};

  historicalBreaches.forEach((breach) => {
    const year = new Date(breach.date).getFullYear().toString();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(breach);
  });

  return grouped;
}

export function getBreachesByOrganization(organization: string): Breach[] {
  return historicalBreaches.filter((breach) =>
    breach.affectedOrganization.toLowerCase().includes(organization.toLowerCase())
  );
}

export function getBreachesBySeverity(severity: Breach["severity"]): Breach[] {
  return historicalBreaches.filter((breach) => breach.severity === severity);
}
