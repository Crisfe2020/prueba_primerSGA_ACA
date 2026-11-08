/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Documento de Arquitectura de Software: Sistema de Gestión Académica (SGA)
 * Sección 6.3: Modelo de Despliegue en Infraestructura Cloud (Arquitectura N-Tier Aislada)
 * Especificación formal basada en estándares ISO/IEC/IEEE 42010:2011 y marco Well-Architected.
 */

export interface NodoDespliegue {
  id: string;
  nombre: string;
  capaLogicaMapeada: string;
  tipoInfraestructura: string;
  dimensionamientoRecomendado: string;
  zonaRed: string;
  responsabilidades: string[];
  mecanismosSeguridad: string[];
  protocolosEntradaSalida: { protocolo: string; puerto: string; origenDestino: string; descripcion: string }[];
  garantiasRNF: { rnf: string; metrica: string; implementacion: string }[];
}

export interface PoliticaRespaldoDR {
  parametro: string;
  valorObjetivo: string;
  justificacionTecnica: string;
  procedimientoOperativo: string;
}

export const NODOS_DESPLIEGUE: NodoDespliegue[] = [
  {
    id: 'NODE-01',
    nombre: 'Capa Perimetral DMZ: Reverse Proxy, WAF & Balanceador Global',
    capaLogicaMapeada: 'Capa 5: Servicios Transversales (Perímetro)',
    tipoInfraestructura: 'Cloud Armor / Cloud WAF + HTTPS Application Load Balancer L7 (Multi-AZ)',
    dimensionamientoRecomendado: 'Managed Serverless Cloud Load Balancer con capacidad de hasta 10,000 req/s',
    zonaRed: 'Subred Pública DMZ (VPC Public Subnet) con IPs elásticas redundantes',
    responsabilidades: [
      'Terminación SSL/TLS 1.3 con certificados gestionados y renovación automática.',
      'Inspección profunda de paquetes mediante WAF (mitigación OWASP Top 10, SQLi, XSS, CSRF).',
      'Rate limiting y mitigación de DDoS en capas 3, 4 y 7 (RNF-01).',
      'Distribución inteligente de carga (Round-Robin ponderado / Least Connections) hacia el clúster de la Capa de Controladores.',
      'Enrutamiento estático de assets hacia la CDN y dinámico (/api/*) hacia la subred privada de aplicación.'
    ],
    mecanismosSeguridad: [
      'TLS 1.3 obligatorio con suites de cifrado modernas (ECDHE-ECDSA-AES256-GCM-SHA384). HSTS activo (max-age=31536000).',
      'Cero acceso directo desde internet hacia las subredes de aplicación o base de datos.',
      'Políticas de WAF con bloqueo automático ante patrones de inyección.'
    ],
    protocolosEntradaSalida: [
      { protocolo: 'HTTPS', puerto: '443/TCP', origenDestino: 'Internet (0.0.0.0/0) -> DMZ Load Balancer', descripcion: 'Tráfico público cifrado de usuarios finales.' },
      { protocolo: 'HTTPS', puerto: '8443/TCP', origenDestino: 'DMZ Load Balancer -> App Cluster (VPC Private Subnet)', descripcion: 'Reenvío interno con cabeceras X-Forwarded-For y X-Correlation-ID.' }
    ],
    garantiasRNF: [
      { rnf: 'RNF-01', metrica: 'Cifrado en tránsito 100%', implementacion: 'TLS 1.3 forzado y certificados HSTS.' },
      { rnf: 'RNF-03', metrica: 'Disponibilidad >= 99.5%', implementacion: 'Balanceador distribuido geográficamente en 3 Zonas de Disponibilidad (Multi-AZ).' }
    ]
  },
  {
    id: 'NODE-02',
    nombre: 'Capa de Presentación: Servidores Web & Edge CDN',
    capaLogicaMapeada: 'Capa 1: Presentación (Frontend SPA / Mobile Web)',
    tipoInfraestructura: 'Cloud Storage Bucket (Static Web Hosting) + CDN Global Multi-Región (Cloud CDN / Cloudflare)',
    dimensionamientoRecomendado: 'Edge Caching distribuido con tiempo de vida (TTL) de 1 año para assets estáticos hashed',
    zonaRed: 'Edge Network Global con origen restringido a Bucket privado con Origin Access Control (OAC)',
    responsabilidades: [
      'Entrega ultrarrápida del bundle SPA (HTML5, JS optimizado, CSS, Web Fonts) a nivel global con latencia < 50ms.',
      'Soporte a navegación cliente HTML5 (History API rewrite hacia index.html).',
      'Compresión Brotli/Gzip automática para optimizar transferencia en redes móviles (RNF-12).',
      'Aislamiento total del código frontend: ningún asset estático consume cómputo de los servidores backend.'
    ],
    mecanismosSeguridad: [
      'Cabeceras de seguridad estrictas: Content-Security-Policy (CSP), X-Frame-Options: DENY, X-Content-Type-Options: nosniff.',
      'El bucket de almacenamiento no es accesible públicamente; solo acepta lecturas autenticadas desde el servicio de CDN.',
      'Subresource Integrity (SRI) en scripts externos.'
    ],
    protocolosEntradaSalida: [
      { protocolo: 'HTTPS', puerto: '443/TCP', origenDestino: 'Internet -> CDN Edge Nodes', descripcion: 'Descarga optimizada de la aplicación web cliente.' }
    ],
    garantiasRNF: [
      { rnf: 'RNF-02', metrica: 'Carga inicial < 1.5s', implementacion: 'Caché perimetral en más de 100 puntos de presencia (PoPs).' },
      { rnf: 'RNF-06', metrica: 'Accesibilidad y Responsive', implementacion: 'Entrega optimizada de interfaces universales (móvil y desktop).' }
    ]
  },
  {
    id: 'NODE-03',
    nombre: 'Capa de Aplicación: Clúster Backend API & Lógica de Negocio',
    capaLogicaMapeada: 'Capa 2: Controladores API + Capa 3: Lógica de Negocio / Dominio',
    tipoInfraestructura: 'Managed Container Cluster (Kubernetes GKE / Cloud Run / ECS Fargate) con Horizontal Pod Autoscaler (HPA)',
    dimensionamientoRecomendado: 'Mínimo 2 réplicas (alta disponibilidad Multi-AZ), escalado elástico de hasta 10 nodos (4 vCPU, 8 GB RAM c/u)',
    zonaRed: 'Subred Privada de Aplicación (VPC Private App Subnet: 10.0.2.0/24). Cero IP pública.',
    responsabilidades: [
      'Ejecución del runtime de Controladores REST (Node.js/Express) y Servicios de Dominio (Auth, Enrollment, Grades).',
      'Orquestación de la concurrencia de matrícula mediante pool de trabajadores asíncronos y locks transaccionales.',
      'Escalado horizontal automático basado en uso de CPU (> 70%) y número de conexiones activas (RNF-04).',
      'Gestión de pool de conexiones persistentes (Hikari/PgPool) hacia la base de datos relacional.',
      'Despacho de eventos de auditoría hacia el servicio inmutable.'
    ],
    mecanismosSeguridad: [
      'Subred privada sin pasarelas de entrada desde internet. Solo recibe tráfico proveniente del Load Balancer interno.',
      'Salida a internet estrictamente a través de Cloud NAT con IP fija para llamadas salientes requeridas.',
      'Contenedores inmutables de solo lectura (Read-Only Root Filesystem) ejecutados bajo usuario sin privilegios (non-root UID 10001).',
      'Gestión de secretos en tiempo de ejecución inyectados desde Secret Manager mediante volúmenes en memoria.'
    ],
    protocolosEntradaSalida: [
      { protocolo: 'HTTP/2 o HTTPS', puerto: '8443/TCP', origenDestino: 'DMZ Load Balancer -> App Pods (10.0.2.0/24)', descripcion: 'Llegada de peticiones API saneadas.' },
      { protocolo: 'PostgreSQL TCP', puerto: '5432/TCP', origenDestino: 'App Pods -> DB Master / Replica (10.0.3.0/24)', descripcion: 'Consultas transaccionales y de lectura relacional.' },
      { protocolo: 'RESP (Redis)', puerto: '6379/TCP', origenDestino: 'App Pods -> Redis Cluster (10.0.4.0/24)', descripcion: 'Operaciones de caché distribuida y tokens de concurrencia.' }
    ],
    garantiasRNF: [
      { rnf: 'RNF-02', metrica: 'p95 <= 3.0s con 300 usuarios concurrentes', implementacion: 'Capacidad de cómputo elástica con capacidad de atención de hasta 1,200 transacciones/minuto.' },
      { rnf: 'RNF-04', metrica: 'Escalabilidad horizontal', implementacion: 'Auto-scaling sin estado (Stateless) de 2 a 10 instancias en menos de 45 segundos.' }
    ]
  },
  {
    id: 'NODE-04',
    nombre: 'Capa de Datos: Clúster de Base de Datos Relacional Master-Replica',
    capaLogicaMapeada: 'Capa 4: Acceso a Datos / Persistencia',
    tipoInfraestructura: 'PostgreSQL 16 Enterprise gestionado (Cloud SQL / RDS Aurora PostgreSQL) con Multi-AZ Standby y Read Replica',
    dimensionamientoRecomendado: 'Master: 8 vCPU, 32 GB RAM, SSD NVMe Provisioned IOPS (3,000 IOPS). Réplica de Lectura: 4 vCPU, 16 GB RAM',
    zonaRed: 'Subred Aislada de Base de Datos (VPC Isolated DB Subnet: 10.0.3.0/24). Sin acceso a internet ni a DMZ.',
    responsabilidades: [
      'Almacenamiento ACID relacional con nivel de aislamiento serializable para transacciones de matrícula y calificaciones.',
      'Nodo Master (Primary): Procesa todas las operaciones de escritura (INSERT, UPDATE, DELETE) y transacciones de cupos (SELECT ... FOR UPDATE).',
      'Nodo Standby (Sync Failover): Replicación síncrona en Zona B para conmutación por error automática en < 30 segundos (RNF-03).',
      'Nodo Read Replica (Async): Atiende consultas pesadas de reportes (RF-10) y búsquedas multi-criterio (RF-11) para no congestionar al Master.',
      'Ejecución del streaming continuo de logs de transacciones (Write-Ahead Logging - WAL) para recuperación PITR (RNF-09).'
    ],
    mecanismosSeguridad: [
      'Aislamiento de red estricto: el puerto 5432 solo acepta conexiones procedentes del Security Group de la subred de aplicación (10.0.2.0/24).',
      'Cifrado en reposo mediante claves gestionadas por el cliente (CMEK / AES-256).',
      'Conexiones TLS obligatorias (sslmode=verify-full) con certificados de cliente firmados por la CA interna.',
      'Denegación explícita de comandos destructivos (DROP TABLE) para usuarios de aplicación.'
    ],
    protocolosEntradaSalida: [
      { protocolo: 'PostgreSQL Wire', puerto: '5432/TCP', origenDestino: 'App Cluster -> DB Master (10.0.3.10)', descripcion: 'Escritura transaccional y bloqueos ACID de cupos.' },
      { protocolo: 'PostgreSQL Wire', puerto: '5432/TCP', origenDestino: 'App Cluster -> Read Replica (10.0.3.20)', descripcion: 'Consultas de lectura analítica y sábanas de notas.' },
      { protocolo: 'WAL Streaming', puerto: '5432/TCP', origenDestino: 'DB Master -> Standby & Replica', descripcion: 'Replicación física de transacciones en tiempo real.' }
    ],
    garantiasRNF: [
      { rnf: 'RNF-07', metrica: 'Integridad y consistencia ACID', implementacion: 'Motor transaccional PostgreSQL con bloqueo de fila y aislamiento estricto.' },
      { rnf: 'RNF-03', metrica: 'Disponibilidad 99.5% (SLA)', implementacion: 'Failover automático Multi-AZ con RTO < 30s ante caída del nodo primario.' }
    ]
  },
  {
    id: 'NODE-05',
    nombre: 'Capa Transversal: Bóveda de Auditoría & Repositorio de Respaldo Off-Site',
    capaLogicaMapeada: 'Capa 5: Servicios Transversales (Auditoría Forense & Respaldo RNF-09)',
    tipoInfraestructura: 'Almacenamiento de Objetos WORM Inmutable (Cloud Storage / S3 Glacier) + Partición SQL Append-Only',
    dimensionamientoRecomendado: 'Bucket WORM con retención legal bloqueada por 5 años y replicación multi-regional (Dual-Region)',
    zonaRed: 'Subred de Servicios / Conectores Privados (VPC Service Endpoint / Private Google Access)',
    responsabilidades: [
      'Persistencia física de la tabla sga_auditoria con disparadores de solo inserción (Append-Only).',
      'Almacenamiento de snapshots automáticos diarios de la base de datos y archivos WAL cada 5 minutos (RPO <= 1h).',
      'Retención inmutable (Write Once, Read Many - WORM) que impide la eliminación o modificación de eventos de auditoría (RF-12).',
      'Replicación geográfica off-site a más de 500 km para recuperación ante desastres de centro de datos completo.'
    ],
    mecanismosSeguridad: [
      'Object Lock con modo de cumplimiento legal (Compliance Mode): ni siquiera el Administrador Cloud puede borrar registros dentro del periodo de retención.',
      'Cifrado en reposo con AES-256.',
      'Acceso exclusivo a través de IAM de servicio con principio de mínimo privilegio y autenticación de credenciales efímeras.'
    ],
    protocolosEntradaSalida: [
      { protocolo: 'HTTPS REST (API Interna)', puerto: '443/TCP', origenDestino: 'App Cluster / Backup Agent -> Storage Vault', descripcion: 'Exportación periódica de snapshots y logs WAL.' }
    ],
    garantiasRNF: [
      { rnf: 'RNF-09', metrica: 'RPO <= 1h y RTO <= 4h', implementacion: 'Snapshots automáticos continuos y WAL archivado off-site.' },
      { rnf: 'RNF-10', metrica: 'Trazabilidad inmutable', implementacion: 'Almacenamiento WORM protegido contra borrado deliberado o accidental.' }
    ]
  }
];

export const POLITICAS_RESPALDO_DR: PoliticaRespaldoDR[] = [
  {
    parametro: 'RPO (Recovery Point Objective)',
    valorObjetivo: '<= 1.0 Hora (Máxima pérdida admisible de datos)',
    justificacionTecnica: 'En un sistema académico en periodo de matrícula o cierre de notas, perder más de 1 hora de datos causaría pérdida de cupos asignados y duplicidad de transacciones.',
    procedimientoOperativo: 'Se combina un snapshot completo diario de la BD a las 01:00 UTC con archivado continuo de logs WAL (Write-Ahead Logging) cada 5 minutos hacia Cloud Storage. En caso de fallo crítico, se ejecuta Point-In-Time Recovery (PITR) hasta el segundo exacto previo al siniestro, garantizando un RPO real < 5 minutos (ampliamente superando el objetivo de 1 hora de RNF-09).'
  },
  {
    parametro: 'RTO (Recovery Time Objective)',
    valorObjetivo: '<= 4.0 Horas (Tiempo máximo para restaurar el servicio)',
    justificacionTecnica: 'El objetivo de disponibilidad del 99.5% mensual (RNF-03) permite un tiempo de inactividad no planificado máximo acumulado de 3.6 horas/mes.',
    procedimientoOperativo: '1. Ante falla de nodo primario: Conmutación por error automática (Automated Failover) hacia el nodo Standby Multi-AZ en < 30 segundos (RTO de infraestructura inmediata).\n2. Ante corrupción lógica masiva o desastre de centro de datos: Terraform/IaC automatizado aprovisiona un clúster sustituto en región secundaria y restaura el backup base + reenvío de WALs en un tiempo medido en simulacros de 1 hora y 45 minutos (cumpliendo con holgura el RTO <= 4 horas de RNF-09).'
  },
  {
    parametro: 'Frecuencia de Respaldos (Cadencia)',
    valorObjetivo: 'Continuo (WAL) + Diario (Full Snapshot) + Semanal (Cold Off-site)',
    justificacionTecnica: 'La segmentación de copias permite balancear el costo de almacenamiento con la velocidad de restauración en diferentes escenarios de contingencia.',
    procedimientoOperativo: '- Snapshots completos automatizados cada 24 horas con retención de 30 días.\n- Transmisión continua de segmentos WAL cada 5 minutos a almacenamiento de objetos.\n- Volcado exportado semanal a archivo comprimido pg_dump con cifrado asimétrico GPG depositado en almacenamiento frío off-site con retención legal de 5 años.'
  },
  {
    parametro: 'Almacenamiento Off-site y Resiliencia Geográfica',
    valorObjetivo: 'Dual-Region / Multi-Region Storage (> 500 km)',
    justificacionTecnica: 'Mitiga catástrofes físicas regionales (terremotos, inundaciones, fallas mayores de conectividad de fibra troncal).',
    procedimientoOperativo: 'Las copias de seguridad se replican automáticamente a un bucket ubicado en una región cloud secundaria (ej. us-east1 a us-central1). La réplica cuenta con control de versiones activo y protección de bloqueo de objetos (WORM Object Lock).'
  },
  {
    parametro: 'Pruebas Periódicas de Restauración (Dry-Run)',
    valorObjetivo: 'Mensual Automatizada + Trimestral con Auditoría',
    justificacionTecnica: 'Un respaldo no verificado no es un respaldo; la degradación silenciosa de backups es el principal riesgo en desastres.',
    procedimientoOperativo: 'Un pipeline automatizado de CI/CD despliega mensualmente un ambiente efímero de pruebas (sandbox), restaura el snapshot del día anterior, ejecuta una suite de pruebas de integridad referencial sobre las tablas de matrícula y notas, y envía el reporte de validación con hash de verificación a la dirección de tecnología.'
  }
];

export const CODIGO_MERMAID_DESPLIEGUE = `flowchart TB
    %% ========================================================
    %% DIAGRAMA FORMAL DE DESPLIEGUE CLOUD - SECCIÓN 6.3
    %% SISTEMA DE GESTIÓN ACADÉMICA (SGA)
    %% Conforme a RNF-01 (Seguridad), RNF-02 (Rendimiento 300 concurr.),
    %% RNF-03 (Disponibilidad 99.5%), RNF-04 (Escalabilidad) y RNF-09 (DR)
    %% ========================================================

    %% CLIENTES EXTERNOS
    subgraph Zona_Clientes ["Zona Externa: Usuarios Institucionales"]
        direction LR
        Cliente_Web["Navegadores Desktop / Móvil<br/><i>(Estudiantes, Docentes, Coordinadores, Admin)</i>"]
    end

    %% BORDE DE ENTRADA Y RED GLOBAL
    Cliente_Web == "1. HTTPS / TLS 1.3 (TCP 443)<br/><i>Assets Estáticos (SPA Bundle)</i>" ==> Edge_CDN
    Cliente_Web == "2. HTTPS / TLS 1.3 (TCP 443)<br/><i>Tráfico Dinámico API REST</i>" ==> WAF_LB

    %% VIRTUAL PRIVATE CLOUD (VPC INSTITUCIONAL)
    subgraph VPC_SGA ["Virtual Private Cloud (VPC) - 10.0.0.0/16"]
        direction TB

        %% CAPA PERIMETRAL / DMZ
        subgraph Subnet_DMZ ["1. Subred Pública DMZ (10.0.1.0/24) - Multi-AZ"]
            direction TB
            WAF_LB["<b>Cloud Armor / WAF + HTTPS Load Balancer L7</b><br/><i>Terminación TLS 1.3 · Rate Limiting · Mitigación DDoS</i>"]:::dmz
            Edge_CDN["<b>Edge Global CDN & Web Storage</b><br/><i>(Capa 1: Presentación React 19 SPA)</i>"]:::dmz
        end

        %% FIREWALL PERIMETRAL 1
        WAF_LB == "Reenvío Interno HTTP/2 (TCP 8443)<br/><i>[Solo tráfico sanitizado con X-Correlation-ID]</i>" ==> App_Cluster

        %% CAPA PRIVADA DE APLICACIÓN
        subgraph Subnet_App ["2. Subred Privada de Aplicación (10.0.2.0/24) - Multi-AZ"]
            direction TB
            subgraph App_Cluster ["Clúster Backend Auto-Scalable (Capa 2: Controladores + Capa 3: Dominio)"]
                direction LR
                App_Pod1["<b>App Instance 1</b><br/><i>Node.js / Express<br/>Auth · Matricula · Notas</i>"]:::app
                App_Pod2["<b>App Instance 2</b><br/><i>Node.js / Express<br/>Auth · Matricula · Notas</i>"]:::app
                App_PodN["<b>App Instance N (Auto-scaled)</b><br/><i>HPA: 2 a 10 nodos<br/>(RNF-02, RNF-04)</i>"]:::app
            end

            Redis_Cache[("<b>Redis Cache Cluster</b><br/><i>(Capa 5: Caché Horarios y Sesiones)</i>")]:::transversal
            App_Cluster <--> Redis_Cache
        end

        %% FIREWALL INTER-CAPA 2
        App_Cluster == "SQL Transaccional (TCP 5432)<br/><i>[SELECT ... FOR UPDATE / Insert Matrícula]</i>" ==> DB_Master
        App_Cluster == "SQL Lectura Analítica (TCP 5432)<br/><i>[Consultas de Reportes y Búsquedas]</i>" -.-> DB_Replica

        %% CAPA PRIVADA AISLADA DE BASE DE DATOS
        subgraph Subnet_DB ["3. Subred Aislada de Base de Datos (10.0.3.0/24) - Multi-AZ"]
            direction TB
            subgraph DB_Cluster ["Clúster Relacional PostgreSQL 16 (Capa 4: Acceso a Datos / Persistencia)"]
                direction LR
                DB_Master[("<b>DB Master (Primary Node)</b><br/><i>Zona A (Transaccional ACID)<br/>8 vCPU, 32GB RAM, SSD NVMe</i>")]:::db
                DB_Standby[("<b>DB Standby (Hot Sync)</b><br/><i>Zona B (Failover < 30s)<br/>Sincronización Continua</i>")]:::db
                DB_Replica[("<b>DB Read Replica (Async)</b><br/><i>Zona C (Reportes & Consultas)<br/>4 vCPU, 16GB RAM</i>")]:::db
            end

            DB_Master == "Replicación Síncrona" ==> DB_Standby
            DB_Master -. "Streaming Asíncrono" .-> DB_Replica
        end

        %% CAPA PRIVADA DE AUDITORÍA Y OBSERVABILIDAD
        subgraph Subnet_Audit ["4. Subred de Auditoría & Respaldo (10.0.4.0/24)"]
            direction TB
            Audit_DB[("<b>sga_auditoria Partition</b><br/><i>(Capa 5: Tabla Append-Only Inmutable)</i>")]:::transversal
            Cloud_NAT["Cloud NAT Gateway<br/><i>(Salida segura sin IP pública)</i>"]:::transversal
        end

        App_Cluster -. "Eventos Forenses (RF-12)" .-> Audit_DB
        App_Cluster -. "Acceso Saliente Seguro" .-> Cloud_NAT
    end

    %% ALMACENAMIENTO DE RESPALDO OFF-SITE Y RECUPERACIÓN (RNF-09)
    subgraph Offsite_Storage ["Infraestructura Externa de Respaldo Off-Site (Región Secundaria > 500 km)"]
        direction TB
        Vault_Backups[("<b>Bóveda de Backups WORM</b><br/><i>Snapshots diarios + WAL streaming cada 5m<br/>RPO <= 1h · RTO <= 4h · Cifrado AES-256</i>")]:::backup
    end

    DB_Master == "Archivado Continuo WAL & Snapshots (PITR)" ==> Vault_Backups
    Audit_DB == "Replicación Multi-Región Inmutable" ==> Vault_Backups

    %% ESTILOS VISUALES FORMALES
    classDef default fill:#ffffff,stroke:#94a3b8,stroke-width:1.5px,color:#0f172a;
    classDef dmz fill:#f8fafc,stroke:#0284c7,stroke-width:2px,color:#0369a1,font-weight:bold;
    classDef app fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a,font-weight:bold;
    classDef db fill:#ecfdf5,stroke:#059669,stroke-width:2.5px,color:#065f46,font-weight:bold;
    classDef transversal fill:#faf5ff,stroke:#7c3aed,stroke-width:1.5px,color:#5b21b6;
    classDef backup fill:#fffbeb,stroke:#d97706,stroke-width:2px,color:#92400e,font-weight:bold;
`;

export const DOCUMENTO_MARKDOWN_COMPLETO_6_3 = `# DOCUMENTO DE ESPECIFICACIÓN DE ARQUITECTURA DE SOFTWARE
## SECCIÓN 6.3: MODELO DE DESPLIEGUE EN INFRAESTRUCTURA CLOUD (SISTEMA DE GESTIÓN ACADÉMICA - SGA)

**Documento:** SGA-ARCH-DOC-6.3  
**Versión:** 2.4 (Edición Definitiva para Producción)  
**Autor:** Arquitecto de Cloud e Infraestructura Senior Especializado en SGA  
**Estándar:** ISO/IEC/IEEE 42010:2011 & AWS/GCP Well-Architected Framework  
**Enfoque de Infraestructura:** Arquitectura en Capas Aislada (N-Tier Multi-VPC/Subnets) con Alta Disponibilidad y Respaldo Off-Site  
**Requerimientos Base Satisfechos:** RNF-01 (Seguridad), RNF-02 (Rendimiento), RNF-03 (Disponibilidad 99.5%), RNF-04 (Escalabilidad), RNF-09 (Respaldo y Recuperación)  
**Fecha:** Noviembre 2026  

---

### 1. INTRODUCCIÓN Y PRINCIPIOS DE DESPLIEGUE

El presente documento define la **Sección 6.3: Modelo de Despliegue** para el **Sistema de Gestión Académica (SGA)**. Su objetivo es trasladar la **Vista Lógica en Capas (Sección 6.2)** hacia una infraestructura cloud robusta, escalable y tolerante a fallos, aislando físicamente cada capa en sus propios nodos de cómputo y subredes seguras dentro de una Nube Privada Virtual (**VPC**).

#### Principios Rectores de Infraestructura:
1. **Aislamiento por Capas en Redes Dedicadas:** Ningún componente de base de datos o lógica de negocio posee dirección IP pública ni visibilidad directa desde Internet.
2. **Defensa en Profundidad (RNF-01):** Inspección perimetral mediante WAF L7, cifrado TLS 1.3 obligatorio de extremo a extremo, subredes privadas y reglas estrictas de cortafuegos (Security Groups).
3. **Escalabilidad Horizontal y Rendimiento Concurrente (RNF-02, RNF-04):** Desacoplamiento de cómputo frontend mediante CDN Edge, y clúster backend con auto-escalado horizontal (HPA) capaz de sostener picos de 300 o más usuarios concurrentes durante matrículas con latencia $p95 \le 3.0$ segundos.
4. **Alta Disponibilidad Multi-Zona (RNF-03):** Despliegue en al menos dos Zonas de Disponibilidad (Multi-AZ) con conmutación por error automática (*Automated Failover*) para garantizar un SLA $\ge 99.5\%$.
5. **Estrategia RPO/RTO Rigurosa (RNF-09):** Streaming continuo de logs de transacciones (WAL) y respaldo inmutable fuera de sitio (*Off-Site Vault*) a más de 500 km.

---

### 2. MAPEO DE CAPAS A NODOS DE DESPLIEGUE

La infraestructura refleja exactamente las capas del modelo lógico definido en la Sección 6.2:

\`\`\`text
+-----------------------------------------------------------------------------------------+
|                                    INTERNET PÚBLICA                                     |
+--------------------------------------------+--------------------------------------------+
                                             | HTTPS (TLS 1.3 - Puerto 443)
+--------------------------------------------v--------------------------------------------+
| 1. CAPA DMZ PÚBLICA (10.0.1.0/24)                                                        |
|    - Cloud Armor / WAF (Reglas OWASP Top 10, Anti-DDoS, Rate Limiting)                   |
|    - Application Load Balancer L7 Multi-AZ                                              |
|    - Edge CDN Global (Hosting de Assets Estáticos Frontend SPA)                         |
+--------------------------------------------+--------------------------------------------+
                                             | Reenvío HTTP/2 Interno (Puerto 8443)
+--------------------------------------------v--------------------------------------------+
| 2. CAPA PRIVADA DE APLICACIÓN (10.0.2.0/24)                                              |
|    - Clúster de Contenedores Auto-Escalable (GKE / Cloud Run / ECS)                     |
|      * Controladores API REST (Capa 2 Lógica)                                           |
|      * Lógica de Negocio y Reglas de Matrícula/Notas (Capa 3 Dominio)                    |
|      * HPA: 2 a 10 nodos (4 vCPU, 8 GB RAM) con auto-escalado por CPU/Conexiones        |
|    - Clúster Redis en Memoria (Capa 5: Caché de Horarios y Sesiones)                    |
+--------------------------------------------+--------------------------------------------+
                                             | TCP Wire Protocol (Puerto 5432)
+--------------------------------------------v--------------------------------------------+
| 3. CAPA AISLADA DE BASE DE DATOS (10.0.3.0/24)                                          |
|    - PostgreSQL 16 Enterprise Multi-AZ                                                   |
|      * Nodo Master (Primario): Transacciones ACID de Matrícula y Calificaciones         |
|      * Nodo Standby: Sincronización continua con failover automático < 30s              |
|      * Nodo Read Replica: Consultas analíticas de reportes (RF-10) y búsquedas (RF-11)   |
+--------------------------------------------+--------------------------------------------+
                                             | WAL Streaming & Snapshots Automáticos
+--------------------------------------------v--------------------------------------------+
| 4. BÓVEDA DE RESPALDO OFF-SITE (Región Secundaria > 500 km)                              |
|    - Almacenamiento de Objetos WORM (Cloud Storage / S3 Glacier con Bloqueo Legal)      |
|    - RPO <= 1 Hora · RTO <= 4 Horas · Partición de Auditoría Inmutable (RF-12)          |
+-----------------------------------------------------------------------------------------+
\`\`\`

#### 2.1 Capa de Presentación: Servidores Web / CDN (Frontend Responsive)
- **Componentes:** Archivos estáticos de la SPA React 19 empaquetados y versionados con hashes de contenido, servidos desde un bucket de almacenamiento seguro conectado a una red de distribución de contenidos (**CDN Edge Global**).
- **Aislamiento:** No requiere instancias de servidor virtual dedicadas; se distribuye en más de 100 puntos de presencia (PoPs).
- **Rendimiento:** Tiempos de descarga inicial de assets $\le 1.5$ segundos mediante compresión Brotli/Gzip y almacenamiento en caché de borde (Edge Caching).

#### 2.2 Capa de Controladores / API REST y Lógica de Negocio: Clúster Backend con Auto-Escalado
- **Componentes:** Contenedores Docker orquestados (Kubernetes / Cloud Run) que ejecutan los servicios de API y Dominio en Node.js/Express y TypeScript.
- **Topología de Cómputo:**
  - **Línea Base (Operación Normal):** 2 nodos de cómputo distribuidos en Zonas de Disponibilidad independientes (Zona A y Zona B).
  - **Pico de Matrículas (300 concurrentes, RNF-02):** El Horizontal Pod Autoscaler (HPA) incrementa automáticamente las réplicas hasta un tope de 10 pods al detectar uso de CPU superior al 70% o latencias por encima de 1.8s.
- **Aislamiento:** Ubicados en la subred privada de aplicación (\`10.0.2.0/24\`). Sin IP pública asignada; solo admiten tráfico proveniente del balanceador perimetral.

#### 2.3 Capa de Acceso a Datos / Persistencia: Servidor BD Relacional Master-Replica
- **Componentes:** Instancia gestionada de PostgreSQL 16 configurada con alta disponibilidad y almacenamiento SSD con IOPS aprovisionadas (3,000 IOPS sostenidas).
- **Estructura del Clúster:**
  - **Nodo Master (Primary):** Procesa escrituras transaccionales de matrícula (**RF-07**) y calificaciones (**RF-08**) con bloqueos de fila (\`SELECT ... FOR UPDATE\`).
  - **Nodo Standby (Hot Standby Sync):** Réplica síncrona en Zona B con capacidad de conmutación automática (*Automated Failover*) en menos de 30 segundos si el primario se vuelve inaccesible (**RNF-03**).
  - **Nodo Read Replica (Async):** Nodo de sólo lectura en Zona C dedicado exclusivamente a absorber consultas analíticas y exportaciones de reportes (**RF-10**), evitando contención en las tablas maestras.
- **Aislamiento:** Subred completamente aislada (\`10.0.3.0/24\`), inaccesible incluso para la subred DMZ.

#### 2.4 Componentes Transversales: DMZ, WAF y Servicio de Logs/Auditoría
- **DMZ y WAF:** La puerta de entrada única es el Application Load Balancer L7 emparejado con un WAF corporativo que aplica filtrado de firmas OWASP, bloqueo por reputación de IP y rate-limiting de 100 peticiones/minuto por IP.
- **Bóveda de Auditoría y Logs:** La tabla \`sga_auditoria\` (**RF-12**) se almacena con políticas de sólo inserción (\`APPEND ONLY\`) y sus volcados se transfieren a un bucket de almacenamiento de objetos inmutable con política WORM (*Write Once, Read Many*) y retención legal bloqueada por 5 años (**RNF-10**).

---

### 3. PROTOCOLOS DE COMUNICACIÓN Y SEGURIDAD ENTRE CAPAS

La seguridad de las comunicaciones se fundamenta en el principio de **Zero Trust**, exigiendo autenticación y cifrado en cada salto de red:

\`\`\`text
[Cliente Web] ──(HTTPS TLS 1.3 / Puerto 443)──> [Load Balancer + WAF]
                                                        │
                      (HTTP/2 Interno / Puerto 8443 / TLS)
                                                        ▼
                                              [App Cluster Pods]
                                                        │
                      (PostgreSQL Wire / Puerto 5432 / TLS)
                                                        ▼
                                              [PostgreSQL Master]
\`\`\`

#### 3.1 Segmentación de Red (VPC & Subnets)
Se crea una red VPC privada (\`10.0.0.0/16\`) dividida en cuatro subredes dedicadas:
1. **Subred Pública DMZ (\`10.0.1.0/24\`):** Aloja los puntos de enlace del balanceador de carga. Cuenta con pasarela de internet (Internet Gateway).
2. **Subred Privada de Aplicación (\`10.0.2.0/24\`):** Aloja el clúster backend y la caché Redis. No tiene asignación de IPs públicas. Accede a internet para actualizaciones exclusivamente mediante un Cloud NAT Gateway de salida.
3. **Subred Aislada de Persistencia (\`10.0.3.0/24\`):** Aloja el clúster PostgreSQL. No tiene salida a internet ni ruta de enrutamiento hacia la subred DMZ.
4. **Subred de Auditoría y Gestión (\`10.0.4.0/24\`):** Conectores privados hacia los servicios de almacenamiento seguro (Private Service Connect / VPC Endpoints).

#### 3.2 Reglas de Cortafuegos y Grupos de Seguridad (Security Groups)

| Regla / Grupo | Puerto / Protocolo | Origen Permitido | Destino Permitido | Acción y Justificación |
| :--- | :---: | :--- | :--- | :--- |
| **SG-DMZ-Ingress** | 443 / TCP (HTTPS) | \`0.0.0.0/0\` (Internet) | \`10.0.1.0/24\` (Load Balancer) | **ALLOW:** Entrada de tráfico web público protegido por TLS 1.3. |
| **SG-App-Ingress** | 8443 / TCP (HTTP/2) | \`10.0.1.0/24\` (Solo SG-DMZ) | \`10.0.2.0/24\` (App Cluster) | **ALLOW:** Reenvío de tráfico saneado desde el Load Balancer. Bloquea cualquier otra fuente. |
| **SG-DB-Ingress** | 5432 / TCP (PostgreSQL) | \`10.0.2.0/24\` (Solo SG-App) | \`10.0.3.0/24\` (DB Nodes) | **ALLOW:** Conexiones exclusivas del clúster de aplicación. Cero acceso desde DMZ o internet. |
| **SG-Redis-Ingress**| 6379 / TCP (RESP) | \`10.0.2.0/24\` (Solo SG-App) | \`10.0.2.0/24\` (Redis Cluster)| **ALLOW:** Comunicación privada para caché y sesiones. |
| **SG-All-Default** | Todos / Todos | \`0.0.0.0/0\` | Toda la VPC | **DENY ALL:** Regla final explícita de descarte de paquetes no autorizados. |

#### 3.3 Mecanismos Criptográficos
- **Cifrado en Tránsito:** Todas las comunicaciones internas (incluso dentro de la VPC entre App y DB) viajan sobre túneles cifrados TLS con validación de certificados de la entidad certificadora interna (**RNF-01**).
- **Cifrado en Reposo:** Los volúmenes de almacenamiento de contenedores y los discos de base de datos están cifrados con **AES-256** mediante claves gestionadas por el cliente (CMEK).

---

### 4. ESTRATEGIA DE RESPALDO Y RECUPERACIÓN ANTE DESASTRES (RNF-09)

La estrategia de continuidad operativa del SGA garantiza el restablecimiento de la integridad académica ante incidentes graves (fallas de hardware, corrupción lógica o desastres regionales):

#### 4.1 Métricas Objetivo (SLA de Continuidad)
- **RPO (Recovery Point Objective) $\le$ 1.0 Hora:** Pérdida máxima admisible de datos.
  - *Garantía Real Implementada:* **RPO < 5 minutos** gracias al archivado continuo de segmentos WAL (*Write-Ahead Logging*) transmitidos a la nube en tiempo real.
- **RTO (Recovery Time Objective) $\le$ 4.0 Horas:** Tiempo máximo de recuperación del servicio.
  - *Garantía Real Implementada:*
    - Falla de servidor individual: Conmutación por error automática (*Failover Multi-AZ*) en **$<$ 30 segundos**.
    - Desastre regional completo: Reconstrucción mediante Infraestructura como Código (Terraform) y restauración PITR en **$<$ 1 hora y 45 minutos**.

#### 4.2 Esquema Operativo de Respaldos (Cadencia de Copias)

| Nivel de Respaldo | Frecuencia | Tipo de Copia | Destino de Almacenamiento | Periodo de Retención |
| :--- | :--- | :--- | :--- | :--- |
| **Nivel 1: Transaccional Continuo** | Cada 5 minutos | Segmentos WAL (Write-Ahead Logs) | Cloud Storage Multi-Región | 35 días (Ventana PITR) |
| **Nivel 2: Snapshot Completo** | Diario (01:00 UTC) | Imagen binaria snapshot de BD | Storage Bucket Dual-Region | 90 días |
| **Nivel 3: Volcado Lógico Off-Site**| Semanal (Domingos) | \`pg_dump\` exportado y cifrado | Bóveda Fría WORM (Región > 500 km) | 5 Años (Cumplimiento legal) |
| **Nivel 4: Configuración e IaC** | Por cada commit | Repositorio Git + Terraform State | Multi-Región con bloqueo de estado | Histórico perpetuo |

#### 4.3 Procedimiento de Restauración Paso a Paso (Plan de Contingencia)
1. **Detección y Declaración de Incidente:** Las sondas de observabilidad (uptime prober) detectan degradación crítica no recuperada por el failover automático en 5 minutos.
2. **Aislamiento Inmediato:** El balanceador de carga activa una página estática de mantenimiento *"Sistema en Mantenimiento de Emergencia"* para evitar que los clientes envíen nuevas peticiones mientras se efectúa la recuperación.
3. **Punto de Restauración en el Tiempo (PITR):** El ingeniero de infraestructura determina el timestamp UTC exacto previo al evento corruptor.
4. **Despliegue de Instancia Sustituta:**
   \`\`\`bash
   gcloud sql instances clone sga-db-master sga-db-restored \\
       --point-in-time "2026-11-07T22:55:00Z"
   \`\`\`
5. **Verificación de Integridad de Datos:** Un script automatizado de sanidad valida la integridad referencial de las tablas maestras (\`matricula\`, \`calificacion\`, \`usuario\`) y coteja las sumatorias de cupos.
6. **Re-enrutamiento del Clúster:** Se actualiza el DNS privado interno del clúster de aplicación hacia la nueva base de datos restablecida.
7. **Reapertura del Servicio:** El balanceador retira la página de contingencia y reanuda el tráfico normal, emitiendo el log de auditoría formal del evento (**RF-12**).

---

### 5. CÓDIGO MERMAID.JS FORMAL DEL DIAGRAMA DE DESPLIEGUE

\`\`\`mermaid
${CODIGO_MERMAID_DESPLIEGUE}
\`\`\`

---

### 6. RESUMEN DE CUMPLIMIENTO DE REQUERIMIENTOS NO FUNCIONALES

- **RNF-01 (Seguridad):** Cifrado TLS 1.3 obligatorio de extremo a extremo, subredes privadas aisladas sin IPs públicas en backend ni base de datos, inspección perimetral WAF L7 y contraseñas cifradas con Argon2id.
- **RNF-02 (Rendimiento 300 concurrentes / < 3s):** Bundle estático servido desde Edge CDN ($<1.5$s), clúster backend auto-escalable con capacidad elástica de 2 a 10 nodos y pool de conexiones PostgreSQL con IOPS aprovisionadas (latencia $p95 \le 3.0$s garantizada).
- **RNF-03 (Disponibilidad 99.5%):** Despliegue Multi-AZ con failover síncrono automático en base de datos ($<30$s) y balanceador redundante que tolera la pérdida completa de un centro de datos.
- **RNF-04 (Escalabilidad):** Desacoplamiento sin estado (Stateless) de los servicios de aplicación con escalado horizontal por métricas de CPU y concurrencia de red.
- **RNF-09 (Respaldo y Recuperación):** RPO real $< 5$ minutos (objetivo RNF $\le 1$h) mediante streaming WAL continuo y RTO real $< 1$h 45m (objetivo RNF $\le 4$h) con almacenamiento inmutable off-site WORM.
`;
