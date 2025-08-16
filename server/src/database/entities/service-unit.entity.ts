import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany
} from 'typeorm';
import { GNService } from './gn-service.entity';
import { MTService } from './mt-service.entity';
import { User } from './user.entity';

@Entity('service_units')
export class ServiceUnit {
    @PrimaryColumn({ type: 'varchar', length: 10 })
    serviceUnitId!: string;

    @Column({ type: 'varchar', length: 100 })
    serviceUnitName!: string;

    // Relations
    @OneToMany(() => GNService, gnService => gnService.serviceUnit)
    gnServices?: GNService[];

    @OneToMany(() => MTService, mtService => mtService.serviceUnit)
    mtServices?: MTService[];

    @OneToMany(() => User, user => user.serviceUnit)
    users?: User[];
}
