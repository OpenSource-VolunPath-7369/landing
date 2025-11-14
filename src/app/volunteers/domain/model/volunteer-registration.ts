/**
 * Represents a volunteer registration for a project/activity.
 * 
 * @remarks
 * This class encapsulates volunteer registration information in the Volunteers bounded context.
 */
export class VolunteerRegistration {
  /**
   * The registration's unique identifier.
   * @readonly
   */
  private readonly _id: string;

  /**
   * The volunteer's user ID.
   * @readonly
   */
  private readonly _userId: string;

  /**
   * The activity/project ID.
   * @readonly
   */
  private readonly _activityId: string;

  /**
   * The registration status.
   * @readonly
   */
  private _status: 'pending' | 'confirmed' | 'cancelled';

  /**
   * The registration timestamp.
   * @readonly
   */
  private readonly _registeredAt: string;

  /**
   * Optional notes.
   * @readonly
   */
  private readonly _notes?: string;

  constructor(
    id: string,
    userId: string,
    activityId: string,
    status: 'pending' | 'confirmed' | 'cancelled',
    registeredAt: string,
    notes?: string
  ) {
    this._id = id;
    this._userId = userId;
    this._activityId = activityId;
    this._status = status;
    this._registeredAt = registeredAt;
    this._notes = notes;
  }

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get activityId(): string { return this._activityId; }
  get status(): 'pending' | 'confirmed' | 'cancelled' { return this._status; }
  get registeredAt(): string { return this._registeredAt; }
  get notes(): string | undefined { return this._notes; }

  /**
   * Confirms the registration.
   */
  confirm(): void {
    if (this._status === 'pending') {
      this._status = 'confirmed';
    }
  }

  /**
   * Cancels the registration.
   */
  cancel(): void {
    if (this._status !== 'cancelled') {
      this._status = 'cancelled';
    }
  }

  /**
   * Checks if the registration is pending.
   * @returns True if the registration is pending.
   */
  isPending(): boolean {
    return this._status === 'pending';
  }

  /**
   * Checks if the registration is confirmed.
   * @returns True if the registration is confirmed.
   */
  isConfirmed(): boolean {
    return this._status === 'confirmed';
  }

  /**
   * Checks if the registration is cancelled.
   * @returns True if the registration is cancelled.
   */
  isCancelled(): boolean {
    return this._status === 'cancelled';
  }
}


