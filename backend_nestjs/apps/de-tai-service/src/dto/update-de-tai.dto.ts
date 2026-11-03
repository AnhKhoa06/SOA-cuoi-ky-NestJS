import { PartialType } from '@nestjs/mapped-types';
import { CreateDeTaiDto } from './create-de-tai.dto';

export class UpdateDeTaiDto extends PartialType(CreateDeTaiDto) {}
