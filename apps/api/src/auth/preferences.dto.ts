import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean,IsIn,IsNumber,IsString,Max,MaxLength,Min,ValidateIf } from 'class-validator';
const supplied=(_object:unknown,value:unknown)=>value!==undefined;
export class PreferencesDto {
 @ApiPropertyOptional({enum:['none','manual','device']}) @ValidateIf(supplied) @IsIn(['none','manual','device']) locationMode?:'none'|'manual'|'device';
 @ApiPropertyOptional() @ValidateIf(supplied) @IsString() @MaxLength(250) address?:string;
 @ApiPropertyOptional() @ValidateIf(supplied) @IsNumber() @Min(-90) @Max(90) latitude?:number;
 @ApiPropertyOptional() @ValidateIf(supplied) @IsNumber() @Min(-180) @Max(180) longitude?:number;
 @ApiPropertyOptional() @ValidateIf(supplied) @IsIn(['granted','denied','undetermined','unavailable','skipped']) locationPermission?:string;
 @ApiPropertyOptional() @ValidateIf(supplied) @IsIn(['granted','denied','undetermined','unavailable','skipped']) notificationPermission?:string;
 @ApiPropertyOptional() @ValidateIf(supplied) @IsBoolean() setupCompleted?:boolean;
}
