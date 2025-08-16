import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { GNAppointment } from './gn-appointment.entity';

export enum AvailabilityStatus {
    AVAILABLE = 'Available',
    BOOKED = 'Booked',
    CANCELLED = 'Cancelled'
}

@Entity('gn_availability')
export class GNAvailability {
    @PrimaryGeneratedColumn()
    gnAvailabilityId!: number;

    @Column({ type: 'varchar', length: 10 })
    userId!: string;

    @Column({ type: 'date' })
    availableDate!: Date;

    @Column({ type: 'time' })
    startTime!: string;

    @Column({ type: 'time' })
    endTime!: string;

    @Column({
        type: 'enum',
        enum: AvailabilityStatus,
        default: AvailabilityStatus.AVAILABLE
    })
    status!: AvailabilityStatus;

    @Column({ type: 'integer', nullable: true })
    gnAppointmentId?: number;

    // Relations
    @ManyToOne(() => User, user => user.gnAvailabilities)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @ManyToOne(() => GNAppointment, { nullable: true })
    @JoinColumn({ name: 'gn_appointment_id' })
    appointment?: GNAppointment;
}
