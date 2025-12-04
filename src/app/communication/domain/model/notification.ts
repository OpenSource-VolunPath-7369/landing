/**
 * Represents a notification in the system.
 * 
 * @remarks
 * This class encapsulates notification information in the Communication bounded context.
 */
export class Notification {
  /**
   * The notification's unique identifier.
   * @readonly
   */
  private readonly _id: string;

  /**
   * The user ID that receives this notification.
   * @readonly
   */
  private readonly _userId: string;

  /**
   * The notification's title.
   * @readonly
   */
  private readonly _title: string;

  /**
   * The notification's message.
   * @readonly
   */
  private readonly _message: string;

  /**
   * The notification's type.
   * @readonly
   */
  private readonly _type: 'new_activity' | 'new_message' | 'activity_confirmed' | 'activity_cancelled' | 'general';

  /**
   * Whether the notification has been read.
   * @readonly
   */
  private _isRead: boolean;

  /**
   * Creation timestamp.
   * @readonly
   */
  private readonly _createdAt: string;

  /**
   * The action URL associated with the notification.
   * @readonly
   */
  private readonly _actionUrl: string;

  constructor(
    id: string,
    userId: string,
    title: string,
    message: string,
    type: 'new_activity' | 'new_message' | 'activity_confirmed' | 'activity_cancelled' | 'general',
    isRead: boolean,
    createdAt: string,
    actionUrl: string
  ) {
    this._id = id;
    this._userId = userId;
    this._title = title;
    this._message = message;
    this._type = type;
    this._isRead = isRead;
    this._createdAt = createdAt;
    this._actionUrl = actionUrl;
  }

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get title(): string { return this._title; }
  get message(): string { return this._message; }
  get type(): 'new_activity' | 'new_message' | 'activity_confirmed' | 'activity_cancelled' | 'general' {
    return this._type;
  }
  get isRead(): boolean { return this._isRead; }
  get createdAt(): string { return this._createdAt; }
  get actionUrl(): string { return this._actionUrl; }

  /**
   * Marks the notification as read.
   */
  markAsRead(): void {
    this._isRead = true;
  }

  /**
   * Checks if the notification is unread.
   * @returns True if the notification is unread.
   */
  isUnread(): boolean {
    return !this._isRead;
  }

  /**
   * Checks if the notification is for a specific user.
   * @param userId - The user ID to check.
   * @returns True if the notification is for the specified user.
   */
  isForUser(userId: string): boolean {
    return this._userId === userId;
  }

  /**
   * Checks if the notification is of a specific type.
   * @param type - The type to check.
   * @returns True if the notification is of the specified type.
   */
  isOfType(type: 'new_activity' | 'new_message' | 'activity_confirmed' | 'activity_cancelled' | 'general'): boolean {
    return this._type === type;
  }
}


