import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm';
import { ServiceUnit } from './service-unit.entity';
import { MTAvailability } from './mt-availability.entity';
import { MTAppointment } from './mt-appointment.entity';

@Entity('mt_services')
export class MTService {
    @PrimaryColumn({ type: 'varchar', length: 10 })
    mtServiceId!: string;

    @Column({ type: 'varchar', length: 100 })
    serviceName!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: false })
    isEnabled!: boolean;

    @Column({ type: 'varchar', length: 10, nullable: true })
    serviceUnitId?: string;

    // Relations
    @ManyToOne(() => ServiceUnit, serviceUnit => serviceUnit.mtServices)
    @JoinColumn({ name: 'service_unit_id' })
    serviceUnit?: ServiceUnit;

    @OneToMany(() => MTAvailability, availability => availability.mtService)
    availabilities?: MTAvailability[];

    @OneToMany(() => MTAppointment, appointment => appointment.mtService)
    appointments?: MTAppointment[];
}
