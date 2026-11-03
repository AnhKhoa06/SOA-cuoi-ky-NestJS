import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeTai } from './de-tai.entity';
import { Repository } from 'typeorm';
import { CreateDeTaiDto } from './dto/create-de-tai.dto';
import { UpdateDeTaiDto } from './dto/update-de-tai.dto';

@Injectable()
export class DeTaiService {
  constructor(
    @InjectRepository(DeTai)
    private readonly deTaiRepository: Repository<DeTai>,
  ) {}

  //Add a new DeTai
  async createDeTai(dto: CreateDeTaiDto): Promise<DeTai> {
    const newDeTai = this.deTaiRepository.create(dto);
    return await this.deTaiRepository.save(newDeTai);
  }

  //Get all DeTai
  async getAllDeTai(): Promise<DeTai[]> {
    return await this.deTaiRepository.find();
  }

  //Get DeTai by id
  async findOne(id: number): Promise<DeTai> {
    const deTai = await this.deTaiRepository.findOneBy({ maDeTai: id });
    if (!deTai) {
      throw new NotFoundException(`Không tìm thấy đề tài với ID: ${id}`);
    }
    return deTai;
  }

  //Update DeTai by id
  async update(id: number, data: UpdateDeTaiDto): Promise<DeTai> {
    const deTai = await this.findOne(id);
    Object.assign(deTai, data);
    return await this.deTaiRepository.save(deTai);
  }

  //Delete DeTai by id
  async remove(id: number): Promise<{ message: string }> {
    const deTai = await this.findOne(id);
    try {
      await this.deTaiRepository.remove(deTai);
    } catch (e: any) {
      const errno = e?.errno ?? e?.driverError?.errno;
      const code = e?.code ?? e?.driverError?.code;
      if (errno === 1451 || code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException(
          'Không thể xóa: đề tài đã có sinh viên đăng ký',
        );
      }
      throw e;
    }
    return { message: `Đã xóa thành công đề tài có ID: ${id}` };
  }
}
