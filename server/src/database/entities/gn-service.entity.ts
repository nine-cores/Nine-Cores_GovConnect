import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm';
import { ServiceUnit } from './service-unit.entity';
import { GNAppointment } from './gn-appointment.entity';

@Entity('gn_services')
export class GNService {
    @PrimaryColumn({ type: 'varchar', length: 6 })
    gnServiceId!: string;

    @Column({ type: 'varchar', length: 100 })
    serviceName!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: false })
    isEnabled!: boolean;

    @Column({ type: 'varchar', length: 10, nullable: true })
    serviceUnitId?: string;

    // Relations
    @ManyToOne(() => ServiceUnit, serviceUnit => serviceUnit.gnServices)
    @JoinColumn({ name: 'service_unit_id' })
    serviceUnit?: ServiceUnit;

    @OneToMany(() => GNAppointment, appointment => appointment.gnService)
    appointments?: GNAppointment[];
}
