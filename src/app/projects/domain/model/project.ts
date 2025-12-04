/**
 * Represents a project in the system.
 * 
 * @remarks
 * This class encapsulates project information in the Projects bounded context.
 */
export class Project {
  /**
   * The project's unique identifier.
   * @readonly
   */
  private readonly _id: string;

  /**
   * The project's title.
   * @readonly
   */
  private readonly _title: string;

  /**
   * The project's description.
   * @readonly
   */
  private readonly _description: string;

  /**
   * The project's image URL.
   * @readonly
   */
  private readonly _image: string;

  /**
   * The organization ID that owns this project.
   * @readonly
   */
  private readonly _organizationId: string;

  /**
   * The organization name.
   * @readonly
   */
  private readonly _organizationName: string;

  /**
   * The organization logo URL.
   * @readonly
   */
  private readonly _organizationLogo: string;

  /**
   * The project's date.
   * @readonly
   */
  private readonly _date: string;

  /**
   * The project's time.
   * @readonly
   */
  private readonly _time: string;

  /**
   * The project's duration.
   * @readonly
   */
  private readonly _duration: string;

  /**
   * The project's location.
   * @readonly
   */
  private readonly _location: string;

  /**
   * Maximum number of volunteers allowed.
   * @readonly
   */
  private readonly _maxVolunteers: number;

  /**
   * Current number of registered volunteers.
   * @readonly
   */
  private _currentVolunteers: number;

  /**
   * Number of likes.
   * @readonly
   */
  private _likes: number;

  /**
   * Whether the current user has liked this project.
   * @readonly
   */
  private _isLiked: boolean;

  /**
   * The project's status.
   * @readonly
   */
  private readonly _status: 'active' | 'completed' | 'cancelled';

  /**
   * The project's category.
   * @readonly
   */
  private readonly _category: string;

  /**
   * The project's tags.
   * @readonly
   */
  private readonly _tags: string[];

  /**
   * The project's requirements.
   * @readonly
   */
  private readonly _requirements: string[];

  /**
   * Creation timestamp.
   * @readonly
   */
  private readonly _createdAt: string;

  /**
   * Last update timestamp.
   * @readonly
   */
  private _updatedAt: string;

  constructor(
    id: string,
    title: string,
    description: string,
    image: string,
    organizationId: string,
    organizationName: string,
    organizationLogo: string,
    date: string,
    time: string,
    duration: string,
    location: string,
    maxVolunteers: number,
    currentVolunteers: number,
    likes: number,
    isLiked: boolean,
    status: 'active' | 'completed' | 'cancelled',
    category: string,
    tags: string[],
    requirements: string[],
    createdAt: string,
    updatedAt: string
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._image = image;
    this._organizationId = organizationId;
    this._organizationName = organizationName;
    this._organizationLogo = organizationLogo;
    this._date = date;
    this._time = time;
    this._duration = duration;
    this._location = location;
    this._maxVolunteers = maxVolunteers;
    this._currentVolunteers = currentVolunteers;
    this._likes = likes;
    this._isLiked = isLiked;
    this._status = status;
    this._category = category;
    this._tags = tags;
    this._requirements = requirements;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get image(): string { return this._image; }
  get organizationId(): string { return this._organizationId; }
  get organizationName(): string { return this._organizationName; }
  get organizationLogo(): string { return this._organizationLogo; }
  get date(): string { return this._date; }
  get time(): string { return this._time; }
  get duration(): string { return this._duration; }
  get location(): string { return this._location; }
  get maxVolunteers(): number { return this._maxVolunteers; }
  get currentVolunteers(): number { return this._currentVolunteers; }
  get likes(): number { return this._likes; }
  get isLiked(): boolean { return this._isLiked; }
  get status(): 'active' | 'completed' | 'cancelled' { return this._status; }
  get category(): string { return this._category; }
  get tags(): string[] { return [...this._tags]; }
  get requirements(): string[] { return [...this._requirements]; }
  get createdAt(): string { return this._createdAt; }
  get updatedAt(): string { return this._updatedAt; }

  /**
   * Checks if the project has available spots for volunteers.
   * @returns True if there are available spots.
   */
  hasAvailableSpots(): boolean {
    return this._currentVolunteers < this._maxVolunteers;
  }

  /**
   * Gets the number of available spots.
   * @returns The number of available spots.
   */
  getAvailableSpots(): number {
    return Math.max(0, this._maxVolunteers - this._currentVolunteers);
  }

  /**
   * Checks if the project is active.
   * @returns True if the project is active.
   */
  isActive(): boolean {
    return this._status === 'active';
  }

  /**
   * Checks if the project is completed.
   * @returns True if the project is completed.
   */
  isCompleted(): boolean {
    return this._status === 'completed';
  }

  /**
   * Checks if the project is cancelled.
   * @returns True if the project is cancelled.
   */
  isCancelled(): boolean {
    return this._status === 'cancelled';
  }

  /**
   * Checks if the project has a specific tag.
   * @param tag - The tag to check.
   * @returns True if the project has the tag.
   */
  hasTag(tag: string): boolean {
    return this._tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  /**
   * Updates the like status.
   * @param isLiked - The new like status.
   */
  updateLikeStatus(isLiked: boolean): void {
    this._isLiked = isLiked;
    this._likes = isLiked ? this._likes + 1 : Math.max(0, this._likes - 1);
    this._updatedAt = new Date().toISOString();
  }

  /**
   * Increments the volunteer count.
   */
  incrementVolunteerCount(): void {
    if (this.hasAvailableSpots()) {
      this._currentVolunteers++;
      this._updatedAt = new Date().toISOString();
    }
  }

  /**
   * Decrements the volunteer count.
   */
  decrementVolunteerCount(): void {
    if (this._currentVolunteers > 0) {
      this._currentVolunteers--;
      this._updatedAt = new Date().toISOString();
    }
  }
}


