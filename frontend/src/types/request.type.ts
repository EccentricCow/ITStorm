export interface RequestType {
  name: string;
  phone: string;
  type: 'order' | 'consultation';
  service?: string
}
