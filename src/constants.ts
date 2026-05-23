import { SiteData, Service, Project, Client } from './types';

export const DEFAULT_SITE: SiteData = {
  companyName: "NEXON Engineering Services (Pvt) Ltd",
  logo: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/photo_2025-03-09_14-25-30-removebg-preview.png",
  stats: { projects: "50+", clients: "30+", years: "8+", support: "24/7" },
  contact: {
    phone: "+94 77 375 3621",
    email: "nexonengineering.service@gmail.com",
    whatsapp: "+94773753621",
    facebook: "https://web.facebook.com/profile.php?id=61584696382140",
    instagram: "",
    address: "WVP9+FGX, Colombo 01000, Colombo 10, Sri Lanka",
    locationVisible: true,
  },
  pages: {
    home: { visible: true, title: "Home", heroTitle: "Engineering Innovation with Precision", heroSubtitle: "Industrial repair, maintenance, and automation solutions.", heroImage: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/Gemini_Generated_Image_hmrljuhmrljuhmrl-Photoroom1215.png", aboutTitle: "About NEXON Engineering", aboutText: "Nexon Engineering is a trusted provider of industrial repair, maintenance, and automation services.", aboutImage: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/Gemini_Generated_Image_e9zrb2e9zrb2e9zr12.png" },
    about: { visible: true, title: "About Us", mission: "To deliver reliable, innovative engineering solutions that empower industries to operate efficiently and safely.", vision: "To be the most trusted engineering services partner in South Asia.", description: "Nexon Engineering provides industrial repair, maintenance and automation solutions across residential, commercial and industrial projects.", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/Gemini_Generated_Image_e9zrb2e9zrb2e9zr12.png" },
    services: { visible: true, title: "Our Services", description: "We offer a comprehensive range of industrial engineering services tailored to your needs." },
    projects: { visible: true, title: "Our Projects", description: "Explore our completed projects across various industries." },
    clients: { visible: true, title: "Our Clients", description: "Trusted by leading companies across Sri Lanka and beyond." },
    contact: { visible: true, title: "Contact Us", description: "Get in touch with our expert team for a free consultation." },
  },
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1',
    title: "Machine Repair, Assembly & Maintenance",
    description: "We provide complete solutions for industrial machinery, including repair, assembly, and preventive maintenance. Our team handles mechanical and electrical troubleshooting, emergency breakdowns, and long-term factory maintenance contracts to ensure smooth and uninterrupted production.",
    icon: "🔧",
    image: new URL('./assets/images/service-machine-repair.png', import.meta.url).href,
    category: "Electrical & Machinery",
    visible: true
  },
  {
    id: 's2',
    title: "Industrial Electrical Wiring",
    description: "We undertake all types of industrial electrical installations, including control panel wiring, system upgrades, VFD setup and programming, and motor control systems. Our services also cover fault finding, rewiring, and concealed or floor wiring solutions for factories and commercial buildings.",
    icon: "⚡",
    image: new URL('./assets/images/service-electrical-wiring.png', import.meta.url).href,
    category: "Electrical & Machinery",
    visible: true
  },
  {
    id: 's3',
    title: "Industrial Automation",
    description: "We design and implement custom automation systems to increase production efficiency. Our services include PLC and HMI programming, automated system design, retrofitting old machines with modern controls, and sensor integration.",
    icon: "🤖",
    image: new URL('./assets/images/service-automation.png', import.meta.url).href,
    category: "Automation & Electronics",
    visible: true
  },
  {
    id: 's4',
    title: "Industrial Electronics Repairs",
    description: "We specialize in the repair of industrial electronic components such as VFDs, PLCs, touchscreens (HMI), servo drives, power supplies, and logic boards. Our precision repair services help minimize downtime by restoring critical electronics to full functionality.",
    icon: "📟",
    image: new URL('./assets/images/service-electronics.png', import.meta.url).href,
    category: "Automation & Electronics",
    visible: true
  },
  {
    id: 's5',
    title: "Mechanical Fabrication",
    description: "We offer heavy and light-duty mechanical fabrication services, including mild steel and stainless steel structures, ducting, tanks, and structural frames. Our expert welders and fabricators ensure high-precision work tailored to industrial requirements.",
    icon: "🏭",
    image: new URL('./assets/images/service-fabrication.png', import.meta.url).href,
    category: "Mechanical & Fabrication",
    visible: true
  },
  {
    id: 's6',
    title: "Spare Parts & Components",
    description: "We supply and install high-quality industrial spare parts, including bearings, seals, gears, belts, and custom-machined components. We also provide specialized sourcing for hard-to-find machinery parts to keep your systems running at peak performance.",
    icon: "📦",
    image: new URL('./assets/images/service-spare-parts.png', import.meta.url).href,
    category: "Mechanical & Fabrication",
    visible: true
  },
  {
    id: 's7',
    title: "On-Site Technical Support",
    description: "Our mobile technical team is available for on-site troubleshooting and on-call support. We provide rapid response to technical issues, minimized machine downtime, and technical consulting for factory optimizations.",
    icon: "🛠️",
    image: new URL('./assets/images/service-technical-support.png', import.meta.url).href,
    category: "Industrial Support & Services",
    visible: true
  },
  {
    id: 's8',
    title: "Industrial Services",
    description: "General maintenance, cleaning and specialized services for industrial environments. We provide factory setup and commissioning, preventive maintenance planning, and power distribution installation.",
    icon: "🏗️",
    image: new URL('./assets/images/service-industrial.png', import.meta.url).href,
    category: "Industrial Support & Services",
    visible: true
  },
  {
    id: 's9',
    title: "Compressed Air Systems",
    description: "Installation and maintenance of compressors and pneumatic systems. Professional compressed air line installation, repair, and maintenance services for industrial environments ensuring leak-free pipelines.",
    icon: "💨",
    image: new URL('./assets/images/service-compressed-air.png', import.meta.url).href,
    category: "Industrial Support & Services",
    visible: true
  },
  {
    id: 's10',
    title: "Solar Engineering",
    description: "Design and installation of solar power systems. Professional solar installation for factories and businesses including panel wiring, testing, commissioning, and hybrid or off-grid system setup.",
    icon: "☀️",
    image: new URL('./assets/images/service-solar.jpg', import.meta.url).href,
    category: "Solar & Security Systems",
    visible: true
  },
  {
    id: 's11',
    title: "CCTV Installation & Service",
    description: "Security systems for industrial and commercial use. NVR setup, IP camera installation, repair, maintenance, and system configuration for homes and businesses.",
    icon: "📹",
    image: new URL('./assets/images/service-cctv.png', import.meta.url).href,
    category: "Solar & Security Systems",
    visible: true
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  { id: 1, title: "Assembly Line PLC Integration", description: "Complete PLC programming and HMI interface for a textile manufacturing plant, reducing manual intervention by 60%.", image: "https://picsum.photos/seed/industrial1/640/360", category: "Automation", client: "Textile Plant", year: "2024", visible: true },
  { id: 2, title: "Automated Conveyor System", description: "Design and installation of variable speed conveyor system with sensors and programmable logic for sorting facility.", image: "https://picsum.photos/seed/conveyor2/640/360", category: "Automation", client: "Sorting Facility", year: "2024", visible: true },
  { id: 3, title: "Pick-and-Place Robotic Cell", description: "Installed and programmed robotic arm for packaging line, increasing throughput by 40% with consistent accuracy.", image: "https://picsum.photos/seed/robotics3/640/360", category: "Automation", client: "Packaging Co.", year: "2024", visible: true },
  { id: 4, title: "Factory Electrical Rewiring", description: "Complete rewire of 5,000 sq ft manufacturing facility including new distribution boards, cable routing, and safety systems.", image: "https://picsum.photos/seed/electrical4/640/360", category: "Electrical", client: "Manufacturing Facility", year: "2023", visible: true },
  { id: 5, title: "CNC Machine Retrofit", description: "Upgraded 15-year-old CNC machine with modern controller, servo drives, and PLC integration for improved precision.", image: "https://picsum.photos/seed/machine5/640/360", category: "Electrical", client: "Industrial Works", year: "2023", visible: true },
  { id: 6, title: "Motor Control Center Upgrade", description: "Installed new MCC with VFDs for 12 motors in beverage processing plant, achieving 25% energy savings.", image: "https://picsum.photos/seed/motor6/640/360", category: "Electrical", client: "Beverage Processing Plant", year: "2023", visible: true },
  { id: 7, title: "50kW Factory Solar System", description: "Designed and installed rooftop solar system with hybrid inverter, battery backup, and remote monitoring dashboard.", image: "https://picsum.photos/seed/solar7/640/360", category: "Solar", client: "Factory Owner", year: "2024", visible: true },
  { id: 8, title: "16-Camera Surveillance System", description: "IP-based CCTV installation with NVR, remote viewing app, night vision cameras, and motion detection alerts.", image: "https://picsum.photos/seed/cctv8/640/360", category: "Security", client: "Commercial Building", year: "2024", visible: true },
  { id: 9, title: "Custom Conveyor Frame Fabrication", description: "Fabricated and installed 20-meter stainless steel conveyor structure with custom brackets and support stands.", image: "https://picsum.photos/seed/welding9/640/360", category: "Fabrication", client: "Industrial Client", year: "2023", visible: true },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: 1, name: "Azmo", description: "Industrial Partner", image: new URL('./assets/images/client-1.png', import.meta.url).href },
  { id: 2, name: "Zahra International", description: "Manufacturing Client", image: new URL('./assets/images/client-2.png', import.meta.url).href },
  { id: 3, name: "Hikma Industries", description: "Corporate Partner", image: new URL('./assets/images/client-3.png', import.meta.url).href },
  { id: 4, name: "Gold Star", description: "Factory Client", image: new URL('./assets/images/client-4.png', import.meta.url).href },
  { id: 5, name: "Pettah Essence Suppliers", description: "Business Partner", image: new URL('./assets/images/client-5.png', import.meta.url).href },
  { id: 6, name: "Resplendent Ceylon", description: "Enterprise Client", image: new URL('./assets/images/client-6.png', import.meta.url).href },
  { id: 7, name: "MAS Holdings", description: "Strategic Apparel Partner", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client7.png" },
  { id: 8, name: "Brandix", description: "Industrial Apparel Client", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client8.png" },
  { id: 9, name: "Holcim Lanka", description: "Industrial Infrastructure", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client9.png" },
  { id: 10, name: "Lankem Ceylon", description: "Chemical & Industrial Partner", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client10.png" },
  { id: 11, name: "Hirdaramani Group", description: "Enterprise Manufacturing", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client11.png" },
  { id: 12, name: "Aitken Spence", description: "Conglomerate Partner", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client12.png" },
  { id: 13, name: "John Keells Holdings", description: "Enterprise Client", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client13.png" },
  { id: 14, name: "Dialog Axiata", description: "Telecommunications Partner", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client14.png" },
  { id: 15, name: "Sri Lanka Telecom", description: "Network Infrastructure Hub", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client15.png" },
  { id: 16, name: "Unilever Sri Lanka", description: "Manufacturing Partner", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client16.png" },
  { id: 17, name: "Nestlé Lanka", description: "Production Facility Client", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client17.png" },
  { id: 18, name: "Coca-Cola Sri Lanka", description: "Industrial Beverage Partner", image: "https://raw.githubusercontent.com/NexonEngineering/nexonengineering.github.io/refs/heads/main/client18.png" },
];
