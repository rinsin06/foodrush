-- ============================================================
-- delivery-service database schema
-- Run this on MySQL port 3311 (delivery_db)
-- ============================================================

CREATE DATABASE IF NOT EXISTS delivery_db;
USE delivery_db;

-- Delivery Partners
CREATE TABLE IF NOT EXISTS delivery_partners (
    id                   BIGINT NOT NULL AUTO_INCREMENT,
    user_id              BIGINT NOT NULL UNIQUE,
    name                 VARCHAR(100) NOT NULL,
    phone                VARCHAR(15) NOT NULL,
    email                VARCHAR(150) NOT NULL,
    vehicle_type         VARCHAR(50) DEFAULT 'BIKE',
    vehicle_number       VARCHAR(20),
    profile_image_url    VARCHAR(500),
    status               ENUM('ONLINE','BUSY','OFFLINE') NOT NULL DEFAULT 'OFFLINE',
    is_verified          BIT(1) DEFAULT 0,
    current_lat          DOUBLE,
    current_lng          DOUBLE,
    current_order_id     BIGINT,
    total_deliveries     INT DEFAULT 0,
    total_earnings       DOUBLE DEFAULT 0.0,
    rating               DOUBLE DEFAULT 5.0,
    last_location_update DATETIME(6),
    created_at           DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_partner_status (status),
    KEY idx_partner_user_id (user_id)
);

-- Delivery Assignments
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id                    BIGINT NOT NULL AUTO_INCREMENT,
    order_id              BIGINT NOT NULL UNIQUE,
    order_number          VARCHAR(30),
    partner_id            BIGINT NOT NULL,
    user_id               BIGINT NOT NULL,
    restaurant_id         BIGINT,
    restaurant_name       VARCHAR(150),
    restaurant_address    VARCHAR(500),
    delivery_address      VARCHAR(500) NOT NULL,
    delivery_lat          DOUBLE,
    delivery_lng          DOUBLE,
    total_amount          DOUBLE,
    delivery_fee          DOUBLE DEFAULT 40.0,
    status                ENUM('PENDING','ACCEPTED','PICKED_UP','DELIVERED','REJECTED','CANCELLED')
                          NOT NULL DEFAULT 'PENDING',
    assigned_at           DATETIME(6),
    accepted_at           DATETIME(6),
    picked_up_at          DATETIME(6),
    delivered_at          DATETIME(6),
    rejected_at           DATETIME(6),
    rejection_reason      VARCHAR(200),
    partner_lat_at_accept DOUBLE,
    partner_lng_at_accept DOUBLE,
    created_at            DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at            DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_assignment_order (order_id),
    KEY idx_assignment_partner (partner_id),
    KEY idx_assignment_status (status),
    KEY idx_assignment_user (user_id)
);

-- Location history (GPS trail during delivery)
CREATE TABLE IF NOT EXISTS location_updates (
    id            BIGINT NOT NULL AUTO_INCREMENT,
    partner_id    BIGINT NOT NULL,
    assignment_id BIGINT,
    order_id      BIGINT,
    latitude      DOUBLE NOT NULL,
    longitude     DOUBLE NOT NULL,
    recorded_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_location_order (order_id),
    KEY idx_location_partner (partner_id),
    KEY idx_location_time (recorded_at)
);

-- Seed test delivery partner (optional)
-- INSERT INTO delivery_partners (user_id, name, phone, email, vehicle_type, vehicle_number, status, is_verified, current_lat, current_lng)
-- VALUES (999, 'Test Partner', '9999999999', 'partner@test.com', 'BIKE', 'KA01AB1234', 'ONLINE', 1, 12.9716, 77.5946);
