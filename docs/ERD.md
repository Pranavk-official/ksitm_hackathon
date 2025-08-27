# ERD (Entity Relationship Diagram)

This file contains a Mermaid ERD for the Prisma schema defined in `schema.prisma`.

```mermaid
erDiagram
    USERS {
        String id PK "UserID"
        String name "Name"
        String email "Email"
        String mobile "Mobile"
        String salt "Salt"
        String passwordHash "PasswordHash"
        String roleId FK "Role"
        DateTime createdAt "CreatedAt"
    }

    ROLES {
        String id PK "RoleID"
        String name "RoleName"
    }

    SERVICE_REQUESTS {
        String id PK "RequestID"
        String userId FK "UserID"
        String serviceType "ServiceType"
        String description "Description"
        Decimal feeAmount "FeeAmount"
        String status "Status"
        DateTime createdAt "CreatedAt"
    }

    AUDIT_LOGS {
        String id PK "LogID"
        String userId FK "UserID"
        String action "Action"
        DateTime timestamp "Timestamp"
    }

    ROLES ||--o{ USERS : has
    USERS ||--o{ SERVICE_REQUESTS : "creates"
    USERS ||--o{ AUDIT_LOGS : "logs"
    
# ERD (auto-generated)

Below is a Mermaid ERD diagram based on `schema.prisma`.

```mermaid
erDiagram
    USERS {
        String id PK "UserID"
        String name "Name"
        String email "Email"
        String mobile "Mobile"
        String salt "Salt"
        String passwordHash "PasswordHash"
        String roleId FK "Role"
        DateTime createdAt "CreatedAt"
    }

    ROLES {
        String id PK "RoleID"
        String name "RoleName"
    }

    SERVICE_REQUESTS {
        String id PK "RequestID"
        String userId FK "UserID"
        String serviceType "ServiceType"
        String description "Description"
        Decimal feeAmount "FeeAmount"
        String status "Status"
        DateTime createdAt "CreatedAt"
    }

    AUDIT_LOGS {
        String id PK "LogID"
        String userId FK "UserID"
        String action "Action"
        DateTime timestamp "Timestamp"
    }

    ROLES ||--o{ USERS : has
    USERS ||--o{ SERVICE_REQUESTS : creates
    USERS ||--o{ AUDIT_LOGS : creates
```

Notes:
- This diagram maps Prisma models to a simple ERD. Enums used: ServiceRequestStatus {PENDING, APPROVED, REJECTED, COMPLETED}.
```

To render this diagram, open this file in a Markdown viewer that supports Mermaid or paste the Mermaid block into mermaid.live.
