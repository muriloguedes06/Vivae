import { IsString, Length, MaxLength } from 'class-validator';

export class SimulatePaymentDto {
  @IsString()
  @MaxLength(64)
  orderId: string;

  @IsString()
  @Length(2, 100)
  cardholderName: string;

  @IsString()
  @Length(12, 24)
  cardNumber: string;

  @IsString()
  @Length(4, 7)
  expiry: string;

  @IsString()
  @Length(3, 4)
  cvv: string;
}
