/**
 * Represents a volunteer in the system.
 * 
 * @remarks
 * This class encapsulates volunteer identity and profile information in the Volunteers bounded context.
 */
export class Volunteer {
  /**
   * The volunteer's unique identifier.
   * @readonly
   */
  private readonly _id: string;

  /**
   * The volunteer's full name.
   * @readonly
   */
  private readonly _name: string;

  /**
   * The volunteer's email address.
   * @readonly
   */
  private readonly _email: string;

  /**
   * The volunteer's avatar URL.
   * @readonly
   */
  private readonly _avatar: string;

  /**
   * The volunteer's role in the system.
   * @readonly
   */
  private readonly _role: 'volunteer' | 'organization_admin' | 'admin';

  /**
   * The date when the volunteer joined.
   * @readonly
   */
  private readonly _joinedDate: string;

  /**
   * The volunteer's biography.
   * @readonly
   */
  private readonly _bio: string;

  /**
   * The volunteer's skills.
   * @readonly
   */
  private readonly _skills: string[];

  /**
   * The volunteer's location.
   * @readonly
   */
  private readonly _location: string;

  /**
   * Creates a new Volunteer instance.
   * @param id - The volunteer's unique identifier.
   * @param name - The volunteer's full name.
   * @param email - The volunteer's email address.
   * @param avatar - The volunteer's avatar URL.
   * @param role - The volunteer's role.
   * @param joinedDate - The date when the volunteer joined.
   * @param bio - The volunteer's biography.
   * @param skills - The volunteer's skills.
   * @param location - The volunteer's location.
   */
  constructor(
    id: string,
    name: string,
    email: string,
    avatar: string,
    role: 'volunteer' | 'organization_admin' | 'admin',
    joinedDate: string,
    bio: string,
    skills: string[],
    location: string
  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._avatar = avatar;
    this._role = role;
    this._joinedDate = joinedDate;
    this._bio = bio;
    this._skills = skills;
    this._location = location;
  }

  /**
   * Gets the volunteer's unique identifier.
   * @returns The volunteer's ID.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Gets the volunteer's full name.
   * @returns The volunteer's name.
   */
  get name(): string {
    return this._name;
  }

  /**
   * Gets the volunteer's email address.
   * @returns The volunteer's email.
   */
  get email(): string {
    return this._email;
  }

  /**
   * Gets the volunteer's avatar URL.
   * @returns The volunteer's avatar.
   */
  get avatar(): string {
    return this._avatar;
  }

  /**
   * Gets the volunteer's role.
   * @returns The volunteer's role.
   */
  get role(): 'volunteer' | 'organization_admin' | 'admin' {
    return this._role;
  }

  /**
   * Gets the volunteer's join date.
   * @returns The join date.
   */
  get joinedDate(): string {
    return this._joinedDate;
  }

  /**
   * Gets the volunteer's biography.
   * @returns The volunteer's bio.
   */
  get bio(): string {
    return this._bio;
  }

  /**
   * Gets the volunteer's skills.
   * @returns The volunteer's skills array.
   */
  get skills(): string[] {
    return [...this._skills];
  }

  /**
   * Gets the volunteer's location.
   * @returns The volunteer's location.
   */
  get location(): string {
    return this._location;
  }

  /**
   * Checks if the volunteer has a specific skill.
   * @param skill - The skill to check.
   * @returns True if the volunteer has the skill.
   */
  hasSkill(skill: string): boolean {
    return this._skills.some(s => s.toLowerCase() === skill.toLowerCase());
  }

  /**
   * Checks if the volunteer is an organization admin.
   * @returns True if the volunteer is an organization admin.
   */
  isOrganizationAdmin(): boolean {
    return this._role === 'organization_admin';
  }

  /**
   * Checks if the volunteer is a system admin.
   * @returns True if the volunteer is a system admin.
   */
  isAdmin(): boolean {
    return this._role === 'admin';
  }
}


