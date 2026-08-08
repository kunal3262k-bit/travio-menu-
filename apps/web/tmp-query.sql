DELETE FROM "TableScan";
DELETE FROM "WaiterRequest";
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "MenuItem";
DELETE FROM "Category";
DELETE FROM "Table";
DELETE FROM "User";
DELETE FROM "Staff";
DELETE FROM "Feedback";
DELETE FROM "Customer";
DELETE FROM "Restaurant";

INSERT INTO "Restaurant" (id, name, slug, currency, "serviceEnabled", status, "createdAt", "updatedAt", phone, address, "brandColor", settings)
VALUES ('demo-restaurant', 'Demo Kitchen', 'demo', 'INR', true, 'LIVE', NOW(), NOW(), '9999999999', 'Demo Address', '#059669', '{}');

INSERT INTO "Table" (id, "restaurantId", number, label, active, "qrToken", "createdAt")
VALUES ('demo-table-1', 'demo-restaurant', 1, 'Table 1', true, 'demo-table-1-token', NOW()),
       ('demo-table-2', 'demo-restaurant', 2, 'Table 2', true, 'demo-table-2-token', NOW());

INSERT INTO "Category" (id, "restaurantId", name, "sortOrder", active)
VALUES ('demo-cat-starters', 'demo-restaurant', 'Starters', 0, true),
       ('demo-cat-mains', 'demo-restaurant', 'Main Course', 1, true);

INSERT INTO "MenuItem" (id, "restaurantId", "categoryId", name, description, "pricePaise", "foodType", "spicyLevel", available, active, "preparationMin", "sortOrder", "createdAt", "updatedAt")
VALUES ('demo-item-paneer', 'demo-restaurant', 'demo-cat-starters', 'Paneer Tikka', 'Smoky cottage cheese skewers', 25000, 'VEG', 0, true, true, 12, 0, NOW(), NOW()),
       ('demo-item-wings', 'demo-restaurant', 'demo-cat-starters', 'Chicken Wings', 'Crispy chicken wings', 32000, 'NON_VEG', 1, true, true, 15, 1, NOW(), NOW()),
       ('demo-item-butter-chicken', 'demo-restaurant', 'demo-cat-mains', 'Butter Chicken', 'Creamy tomato curry', 45000, 'NON_VEG', 1, true, true, 18, 0, NOW(), NOW()),
       ('demo-item-dal', 'demo-restaurant', 'demo-cat-mains', 'Dal Makhani', 'Slow-cooked lentils', 28000, 'VEG', 0, true, true, 15, 1, NOW(), NOW());

INSERT INTO "User" (id, "restaurantId", email, name, "passwordHash", role, active, "createdAt")
VALUES ('demo-user-admin', 'demo-restaurant', 'demo@swifttab.com', 'Demo Owner', '$2a$10$6H4C8NoVwzHe1vV5T2zOp.6KcDXCsmCemtPz9uQm.sxLx1Yj9Qv3e', 'ADMIN', true, NOW());
