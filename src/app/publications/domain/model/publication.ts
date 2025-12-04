/**
 * Represents a publication in the system.
 * 
 * @remarks
 * This class encapsulates publication information in the Publications bounded context.
 */
export class Publication {
  /**
   * The publication's unique identifier.
   * @readonly
   */
  private readonly _id: string;

  /**
   * The publication's title.
   * @readonly
   */
  private readonly _title: string;

  /**
   * The publication's description.
   * @readonly
   */
  private readonly _description: string;

  /**
   * The publication's image URL.
   * @readonly
   */
  private readonly _image: string;

  /**
   * The organization ID that owns this publication.
   * @readonly
   */
  private readonly _organizationId: string;

  /**
   * Number of likes.
   * @readonly
   */
  private _likes: number;

  /**
   * The publication's date.
   * @readonly
   */
  private readonly _date: string;

  /**
   * The publication's time.
   * @readonly
   */
  private readonly _time: string;

  /**
   * The publication's location.
   * @readonly
   */
  private readonly _location: string;

  /**
   * Maximum number of volunteers.
   * @readonly
   */
  private readonly _maxVolunteers: number;

  /**
   * Current number of volunteers registered.
   * @readonly
   */
  private readonly _currentVolunteers: number;

  /**
   * The publication's status.
   * @readonly
   */
  private readonly _status: 'draft' | 'published' | 'archived';

  /**
   * The publication's tags.
   * @readonly
   */
  private readonly _tags: string[];

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
    likes: number,
    date: string,
    time: string,
    location: string,
    maxVolunteers: number,
    currentVolunteers: number,
    status: 'draft' | 'published' | 'archived',
    tags: string[],
    createdAt: string,
    updatedAt: string
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._image = image;
    this._organizationId = organizationId;
    this._likes = likes;
    this._date = date;
    this._time = time;
    this._location = location;
    this._maxVolunteers = maxVolunteers;
    this._currentVolunteers = currentVolunteers;
    this._status = status;
    this._tags = tags;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get image(): string { return this._image; }
  get organizationId(): string { return this._organizationId; }
  get likes(): number { return this._likes; }
  get date(): string { return this._date; }
  get time(): string { return this._time; }
  get location(): string { return this._location; }
  get maxVolunteers(): number { return this._maxVolunteers; }
  get currentVolunteers(): number { return this._currentVolunteers; }
  get status(): 'draft' | 'published' | 'archived' { return this._status; }
  get tags(): string[] { return [...this._tags]; }
  get createdAt(): string { return this._createdAt; }
  get updatedAt(): string { return this._updatedAt; }

  /**
   * Checks if the publication is a draft.
   * @returns True if the publication is a draft.
   */
  isDraft(): boolean {
    return this._status === 'draft';
  }

  /**
   * Checks if the publication is published.
   * @returns True if the publication is published.
   */
  isPublished(): boolean {
    return this._status === 'published';
  }

  /**
   * Checks if the publication is archived.
   * @returns True if the publication is archived.
   */
  isArchived(): boolean {
    return this._status === 'archived';
  }

  /**
   * Checks if the publication has a specific tag.
   * @param tag - The tag to check.
   * @returns True if the publication has the tag.
   */
  hasTag(tag: string): boolean {
    return this._tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  /**
   * Increments the like count.
   */
  incrementLikes(): void {
    this._likes++;
    this._updatedAt = new Date().toISOString();
  }

  /**
   * Decrements the like count.
   */
  decrementLikes(): void {
    this._likes = Math.max(0, this._likes - 1);
    this._updatedAt = new Date().toISOString();
  }

  /**
   * Checks if there are available spots for volunteers.
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
}

