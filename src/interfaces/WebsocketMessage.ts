export interface WebsocketMessage<T> {
  Event: string;
  Payload: T;
}
