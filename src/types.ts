export interface SiteData {
  companyName: string;
  logo: string;
  stats: {
    projects: string;
    clients: string;
    years: string;
    support: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    address: string;
    locationVisible: boolean;
  };
  pages: {
    [key: string]: {
      visible: boolean;
      title: string;
      subtitle?: string;
      [key: string]: any;
    };
  };
}

export interface Service {
  id: number | string;
  title: string;
  description: string;
  icon: string;
  image: string;
  category: string;
  visible: boolean;
}

export interface Project {
  id: number | string;
  title: string;
  description: string;
  image: string;
  category: string;
  client: string;
  year: string;
  visible: boolean;
}

export interface Client {
  id: number | string;
  name: string;
  description: string;
  image: string;
  link?: string;
  visible?: boolean;
}

export interface Message {
  id: number | string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
  type?: string;
}

export interface Review {
  id: number | string;
  name: string;
  role: string;
  company?: string;
  review: string;
  rating: number;
  visible: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
