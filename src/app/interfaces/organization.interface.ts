export interface Organization {
  id: string;
  name: string;
  email: string;
  location: string;
  phone: string;
  type: string;
  logo?: string; // Logo/avatar de la organización
}

export interface Representative {
  id: string;
  name: string;
  email: string;
}

export interface OrganizationProfile {
  organization: Organization;
  representative: Representative;
}

export interface UpdateOrganizationProfile {
  organizationName: string;
  organizationEmail: string;
  organizationLocation: string;
  organizationPhone: string;
  organizationType: string;
  representativeName: string;
  representativeEmail: string;
}
