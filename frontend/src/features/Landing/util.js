import { 
  CloudSun, 
  Wind,
  Flower,
  Droplets,
  Activity,
  LineChart,
  PieChart,
  Users,
  MessageCircle,
  Zap,
  BarChart4,
  Cpu,
  AlertCircle
} from 'lucide-react';

import { Linkedin, Mail, Award } from 'lucide-react';
/**
 * Data for carousel slides
 */
export const carouselData = [
  {
    image: '/carousel/hydro.jpg',
    title: "Hydro Power Energy",
    description: "Hydropower energy uses flowing or falling water to generate electricity, making it one of the most widely used renewable energy sources globally.",
    details: "In the Philippines, hydropower supplies about 10-12% of the country's electricity. With its abundant rivers and high rainfall, the nation hosts significant projects.",
    color: '#3498db'
  },
  {
    image: '/carousel/solar.jpg',
    title: "Solar Energy",
    description: "Solar power harnesses the sun's energy to generate clean electricity, providing a sustainable solution for our growing energy needs.",
    details: "The Philippines has great potential for solar energy with an average of 5.1 kWh/m² per day of solar radiation.",
    color: '#f39c12'
  },
  {
    image: '/carousel/wind.jpg',
    title: "Wind Power",
    description: "Wind energy captures the natural power of wind through turbines, converting it into renewable electricity.",
    details: "The Philippines' wind energy sector is growing, with several wind farms contributing to the national power grid.",
    color: '#2ecc71'
  },
  {
    image: '/carousel/geothermal.jpg',
    title: "Geothermal Energy",
    description: "Geothermal energy taps into Earth's internal heat to generate reliable and sustainable power.",
    details: "The Philippines is the world's third-largest geothermal energy producer, with several active geothermal plants throughout the volcanic regions of the country.",
    color: '#e74c3c'
  },
  {
    image: '/carousel/biomass.jpg',
    title: "Biomass Energy",
    description: "Biomass energy converts organic materials into power, utilizing agricultural waste, forest residues, and dedicated energy crops.",
    details: "In the Philippines, biomass has significant potential due to the country's large agricultural sector, with rice husks, coconut residues, and bagasse being common biomass sources.",
    color: '#27ae60'
  }
];

/**
 * Energy types data
 */
export const energyTypes = [
  {
    type: "Solar",
    icon: <CloudSun size={32} />,
    color: '#f39c12',
    description: "Harnessing the sun's power for sustainable energy"
  },
  {
    type: "Wind",
    icon: <Wind size={32} />,
    color: '#2ecc71',
    description: "Converting wind power into clean electricity"
  },
  {
    type: "Geothermal",
    icon: <Flower size={32} />,
    color: '#e74c3c',
    description: "Utilizing Earth's heat for renewable energy"
  },
  {
    type: "Hydropower",
    icon: <Droplets size={32} />,
    color: '#3498db',
    description: "Generating power from flowing water"
  },
  {
    type: "Biomass",
    icon: <Flower size={32} />,
    color: '#27ae60',
    description: "Converting organic matter into sustainable energy"
  }
];

/**
 * Features data
 */
export const features = [
  {
    icon: <Activity size={32} />,
    title: "Real-time Monitoring",
    description: "Track energy production and consumption with instant updates and comprehensive dashboards for optimal resource management."
  },
  {
    icon: <LineChart size={32} />,
    title: "Advanced Analytics",
    description: "Gain detailed insights and performance metrics to optimize your renewable energy systems with ML-powered prediction models."
  },
  {
    icon: <PieChart size={32} />,
    title: "Resource Distribution",
    description: "Efficiently allocate and manage energy resources across different systems with intelligent load balancing algorithms."
  },
  {
    icon: <MessageCircle size={32} />,
    title: "Community Engagement",
    description: "Connect with others interested in renewable energy solutions through our collaborative platform and knowledge sharing tools."
  }
];

/**
 * Additional features for extended display
 */
export const extendedFeatures = [
  {
    icon: <AlertCircle size={32} />,
    title: "Predictive Maintenance",
    description: "Reduce downtime with AI-powered early warning systems that detect potential issues before they affect performance."
  },
  {
    icon: <Zap size={32} />,
    title: "Energy Optimization",
    description: "Automated systems to maximize energy output based on environmental conditions and usage patterns."
  },
  {
    icon: <BarChart4 size={32} />,
    title: "Comprehensive Reporting",
    description: "Generate detailed reports on energy production, consumption, and environmental impact for stakeholders."
  },
  {
    icon: <Cpu size={32} />,
    title: "Smart Grid Integration",
    description: "Seamlessly connect to smart grid systems for efficient energy distribution and management across networks."
  }
];

/**
 * Team members data
 */
export const teamMembers = [
  {
    name: "John Leonard O. Nagallo",
    role: "Backend",
    image: "/team/leonard_suit.jpg",
    bio: "College student working on the backend using Python for AI predictive analytics."
  },
  {
    name: "Jade C. Pis-An",
    role: "Frontend",
    image: "/team/jade_suit.jpg",
    bio: "College student developing the frontend with ReactJS and improving user experience."
  },
  {
    name: "Gwyneth Ortiz",
    role: "Documentation",
    image: "/team/gwyneth.png",
    bio: "College student handling project documentation and ensuring clear communication."
  },
  {
    name: "Lester I. Sible",
    role: "Frontend",
    image: "/team/sible.jpg",
    bio: "College student contributing to frontend design and functionality using ReactJS."
  }
];


/**
 * Statistics data
 */
export const statistics = [
  {
    value: "10,000+",
    label: "Energy Sources Monitored",
    icon: <CloudSun size={32} />
  },
  {
    value: "5M+",
    label: "kWh Saved",
    icon: <Activity size={32} />
  },
  {
    value: "15+",
    label: "Countries Served",
    icon: <Users size={32} />
  },
  {
    value: "98%",
    label: "Client Satisfaction",
    icon: <MessageCircle size={32} />
  }
];

/**
 * Helper function to format numbers
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Helper function for gradient colors
 * @param {string} baseColor - Base color in hex
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} Color with opacity
 */
export const getColorWithOpacity = (baseColor, opacity = 0.2) => {
  // If hex is provided with # prefix
  if (baseColor.startsWith('#')) {
    return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  }
  return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};


// Advisor data
export const advisorData = {
  name: "Prof. Pops V. Madriaga",
  role: "Thesis Advisor",
  image: "/prof.jpg", // Replace with actual image path
  acknowledgment: "We extend our heartfelt gratitude to Prof. Pops V. Madriaga for her exceptional guidance, unwavering support, and invaluable insights throughout our thesis journey. Her expertise in renewable energy systems and commitment to sustainable development has been instrumental in shaping our project. Beyond technical guidance, she inspired us to think critically and pursue innovative solutions to real-world challenges facing our communities.",
  quote: "Her dedication to academic excellence and passion for sustainable energy solutions has not only enhanced the quality of our research but has also instilled in us a deeper appreciation for the impact our work can have on building a greener future for the Philippines.",
  socialLinks: [
    {
      url: "#",
      icon: <Linkedin size={18} />,
      color: "#0077b5",
      hoverColor: "#0077b5"
    },
    {
      url: "mailto:pops.madriaga@example.edu.ph",
      icon: <Mail size={18} />,
      color: "#ea4335",
      hoverColor: "#ea4335"
    },
    {
      url: "#",
      icon: <Award size={18} />,
      color: "#6c5ce7",
      hoverColor: "#6c5ce7"
    }
  ]
};