import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { MTService } from './mt-service.entity';

export enum AvailabilityStatus {
    AVAILABLE = 'Available',
    BOOKED = 'Booked',
    CANCELLED = 'Cancelled'
}

@Entity('mt_availability')
export class MTAvailability {
    @PrimaryGeneratedColumn()
    mtAvailabilityId!: number;

    @Column({ type: 'varchar', length: 10 })
    userId!: string;

    @Column({ type: 'varchar', length: 10 })
    mtServiceId!: string;

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

    // Relations
    @ManyToOne(() => User, user => user.mtAvailabilities)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @ManyToOne(() => MTService, mtService => mtService.availabilities)
    @JoinColumn({ name: 'mt_service_id' })
    mtService?: MTService;
}
