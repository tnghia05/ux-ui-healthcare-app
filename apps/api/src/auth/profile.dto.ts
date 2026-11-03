import { ApiProperty } from '@nestjs/swagger';
import { IsIn,IsISO8601,IsString,Matches,MaxLength,MinLength } from 'class-validator';
export class ProfileDto {
 @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!:string;
 @ApiProperty({example:'0901234567'}) @IsString() @Matches(/^(0|\+84)[0-9]{9}$/) phone!:string;
 @ApiProperty({example:'2000-05-15'}) @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsISO8601({strict:true}) birthDate!:string;
 @ApiProperty({enum:['female','male','other','not_specified']}) @IsIn(['female','male','other','not_specified']) gender!:'female'|'male'|'other'|'not_specified';
}
