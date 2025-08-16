import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { Citizen } from './citizen.entity';
import { User } from './user.entity';
import { GNService } from './gn-service.entity';

export enum AppointmentStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled'
}

@Entity('gn_appointments')
export class GNAppointment {
    @PrimaryGeneratedColumn()
    gnAppointmentId!: number;

    @Column({ type: 'varchar', length: 12 })
    citizenNic!: string;

    @Column({ type: 'varchar', length: 10 })
    userId!: string;

    @Column({ type: 'varchar', length: 10 })
    gnServiceId!: string;

    @Column({ type: 'date' })
    appointmentDate!: Date;

    @Column({ type: 'time' })
    startTime!: string;

    @Column({ type: 'time' })
    endTime!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    purpose?: string;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING
    })
    status!: AppointmentStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Relations
    @ManyToOne(() => Citizen, citizen => citizen.gnAppointments)
    @JoinColumn({ name: 'citizen_nic' })
    citizen?: Citizen;

    @ManyToOne(() => User, user => user.gnAppointments)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @ManyToOne(() => GNService, gnService => gnService.appointments)
    @JoinColumn({ name: 'gn_service_id' })
    gnService?: GNService;
}
