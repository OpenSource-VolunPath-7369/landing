/**
 * Represents an organization in the system.
 * 
 * @remarks
 * This class encapsulates organization information in the Organizations bounded context.
 */
export class Organization {
  /**
   * The organization's unique identifier.
   * @readonly
   */
  private readonly _id: string;

  /**
   * The organization's name.
   * @readonly
   */
  private readonly _name: string;

  /**
   * The organization's logo URL.
   * @readonly
   */
  private readonly _logo: string;

  /**
   * The organization's description.
   * @readonly
   */
  private readonly _description: string;

  /**
   * The organization's website URL.
   * @readonly
   */
  private readonly _website: string;

  /**
   * The organization's email.
   * @readonly
   */
  private readonly _email: string;

  /**
   * The organization's phone number.
   * @readonly
   */
  private readonly _phone: string;

  /**
   * The organization's address.
   * @readonly
   */
  private readonly _address: string;

  /**
   * The year the organization was founded.
   * @readonly
   */
  private readonly _foundedYear: number;

  /**
   * The number of volunteers.
   * @readonly
   */
  private readonly _volunteerCount: number;

  /**
   * The organization's rating.
   * @readonly
   */
  private readonly _rating: number;

  /**
   * The organization's categories.
   * @readonly
   */
  private readonly _categories: string[];

  /**
   * Whether the organization is verified.
   * @readonly
   */
  private readonly _isVerified: boolean;

  /**
   * The organization's social media links.
   * @readonly
   */
  private readonly _socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };

  constructor(
    id: string,
    name: string,
    logo: string,
    description: string,
    website: string,
    email: string,
    phone: string,
    address: string,
    foundedYear: number,
    volunteerCount: number,
    rating: number,
    categories: string[],
    isVerified: boolean,
    socialMedia: { facebook?: string; instagram?: string; twitter?: string; }
  ) {
    this._id = id;
    this._name = name;
    this._logo = logo;
    this._description = description;
    this._website = website;
    this._email = email;
    this._phone = phone;
    this._address = address;
    this._foundedYear = foundedYear;
    this._volunteerCount = volunteerCount;
    this._rating = rating;
    this._categories = categories;
    this._isVerified = isVerified;
    this._socialMedia = socialMedia;
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get logo(): string { return this._logo; }
  get description(): string { return this._description; }
  get website(): string { return this._website; }
  get email(): string { return this._email; }
  get phone(): string { return this._phone; }
  get address(): string { return this._address; }
  get foundedYear(): number { return this._foundedYear; }
  get volunteerCount(): number { return this._volunteerCount; }
  get rating(): number { return this._rating; }
  get categories(): string[] { return [...this._categories]; }
  get isVerified(): boolean { return this._isVerified; }
  get socialMedia(): { facebook?: string; instagram?: string; twitter?: string; } {
    return { ...this._socialMedia };
  }

  /**
   * Gets the organization's age in years.
   * @returns The organization's age.
   */
  getAge(): number {
    return new Date().getFullYear() - this._foundedYear;
  }

  /**
   * Checks if the organization has a specific category.
   * @param category - The category to check.
   * @returns True if the organization has the category.
   */
  hasCategory(category: string): boolean {
    return this._categories.some(c => c.toLowerCase() === category.toLowerCase());
  }

  /**
   * Checks if the organization has a high rating.
   * @returns True if the rating is 4.0 or higher.
   */
  hasHighRating(): boolean {
    return this._rating >= 4.0;
  }

  /**
   * Checks if the organization has social media presence.
   * @returns True if the organization has at least one social media link.
   */
  hasSocialMedia(): boolean {
    return !!(this._socialMedia.facebook || this._socialMedia.instagram || this._socialMedia.twitter);
  }
}


