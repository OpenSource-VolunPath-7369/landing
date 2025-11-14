/**
 * Represents a message in the system.
 * 
 * @remarks
 * This class encapsulates message information in the Communication bounded context.
 */
export class Message {
  /**
   * The message's unique identifier.
   * @readonly
   */
  private readonly _id: string;

  /**
   * The sender's ID.
   * @readonly
   */
  private readonly _senderId: string;

  /**
   * The sender's name.
   * @readonly
   */
  private readonly _senderName: string;

  /**
   * The sender's icon URL.
   * @readonly
   */
  private readonly _senderIcon: string;

  /**
   * The recipient's ID.
   * @readonly
   */
  private readonly _recipientId: string;

  /**
   * The message content.
   * @readonly
   */
  private readonly _content: string;

  /**
   * The message timestamp.
   * @readonly
   */
  private readonly _timestamp: string;

  /**
   * Whether the message has been read.
   * @readonly
   */
  private _isRead: boolean;

  /**
   * The message type.
   * @readonly
   */
  private readonly _type: 'volunteer_inquiry' | 'activity_details' | 'confirmation' | 'thank_you' | 'general';

  /**
   * The sender's organization name (optional, only for organization senders).
   */
  public senderOrganization?: string;

  constructor(
    id: string,
    senderId: string,
    senderName: string,
    senderIcon: string,
    recipientId: string,
    content: string,
    timestamp: string,
    isRead: boolean,
    type: 'volunteer_inquiry' | 'activity_details' | 'confirmation' | 'thank_you' | 'general',
    senderOrganization?: string
  ) {
    this._id = id;
    this._senderId = senderId;
    this._senderName = senderName;
    this._senderIcon = senderIcon;
    this._recipientId = recipientId;
    this._content = content;
    this._timestamp = timestamp;
    this._isRead = isRead;
    this._type = type;
    this.senderOrganization = senderOrganization;
  }

  get id(): string { return this._id; }
  get senderId(): string { return this._senderId; }
  get senderName(): string { return this._senderName; }
  get senderIcon(): string { return this._senderIcon; }
  get recipientId(): string { return this._recipientId; }
  get content(): string { return this._content; }
  get timestamp(): string { return this._timestamp; }
  get isRead(): boolean { return this._isRead; }
  get type(): 'volunteer_inquiry' | 'activity_details' | 'confirmation' | 'thank_you' | 'general' {
    return this._type;
  }

  /**
   * Marks the message as read.
   */
  markAsRead(): void {
    this._isRead = true;
  }

  /**
   * Checks if the message is unread.
   * @returns True if the message is unread.
   */
  isUnread(): boolean {
    return !this._isRead;
  }

  /**
   * Checks if the message is from a specific sender.
   * @param senderId - The sender ID to check.
   * @returns True if the message is from the specified sender.
   */
  isFrom(senderId: string): boolean {
    return this._senderId === senderId;
  }

  /**
   * Checks if the message is to a specific recipient.
   * @param recipientId - The recipient ID to check.
   * @returns True if the message is to the specified recipient.
   */
  isTo(recipientId: string): boolean {
    return this._recipientId === recipientId;
  }
}


