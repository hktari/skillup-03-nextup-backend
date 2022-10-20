export class CreateEventDto {
  title: string;
  description: string;
  location: string;
  max_users: number;
  imageBase64: string;
  datetime: Date;
}
