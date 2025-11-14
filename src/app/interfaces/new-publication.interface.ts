export interface NewPublication {
  title: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
  organizationId: string;
  tags: string[];
  isPublic: boolean;
  scheduledDate?: Date;
}

export interface PublicationFormData {
  title: string;
  description: string;
  image: File | null;
  organizationId: string;
  tags: string;
  isPublic: boolean;
  scheduledDate: string;
}
