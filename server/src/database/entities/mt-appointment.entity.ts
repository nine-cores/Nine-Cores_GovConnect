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
import { MTService } from './mt-service.entity';

export enum AppointmentStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled'
}

@Entity('mt_appointments')
export class MTAppointment {
    @PrimaryGeneratedColumn()
    mtAppointmentId!: number;

    @Column({ type: 'varchar', length: 12 })
    citizenNic!: string;

    @Column({ type: 'varchar', length: 10 })
    userId!: string;

    @Column({ type: 'varchar', length: 10 })
    mtServiceId!: string;

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
    @ManyToOne(() => Citizen, citizen => citizen.mtAppointments)
    @JoinColumn({ name: 'citizen_nic' })
    citizen?: Citizen;

    @ManyToOne(() => User, user => user.mtAppointments)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @ManyToOne(() => MTService, mtService => mtService.appointments)
    @JoinColumn({ name: 'mt_service_id' })
    mtService?: MTService;
}
