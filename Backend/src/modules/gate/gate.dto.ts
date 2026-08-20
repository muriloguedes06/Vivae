import { IsString, Length, MaxLength } from 'class-validator';

export class ValidateTicketDto {
  @IsString()
  @Length(8, 128)
  code: string;

  @IsString()
  @MaxLength(64)
  eventId: string;
}
