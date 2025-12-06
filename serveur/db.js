const knex = require('knex');

const db = knex({
    client: 'sqlite3',
    connection: { 
       filename: "./basededonnees.sqlite3",
    },
    useNullAsDefault: true
});


// ===============================================
// Création automatique des tables
// ===============================================
async function createTable() {

    // =================== USERS ===================
    const existsUser = await db.schema.hasTable("User");
    if (!existsUser) {
        await db.schema.createTable("User", (table) => {
            table.string("id").primary();
            table.string("username").notNullable();
            table.string("password").notNullable();
            table.timestamp("created_at").defaultTo(db.fn.now());
        });
        console.log("Table 'User' créée.");
    }

    // =================== CLIENTS ===================
    const hasClients = await db.schema.hasTable("clients");
    if (!hasClients) {
        await db.schema.createTable("clients", (table) => {
            table.string("id").primary();
            table.string("nom").notNullable();
            table.string("prenom").notNullable();
            table.string("telephone").notNullable();
            table.string("email").notNullable();
            table.string("adresse").notNullable();
            table.timestamp("creer_depuis").defaultTo(db.fn.now());
        });
        console.log("Table 'clients' créée.");
    }

    // =================== LOANS ===================
    const hasLoans = await db.schema.hasTable("loans");
    if (!hasLoans) {
        await db.schema.createTable("loans", (table) => {
            table.string("id").primary();
            
            // FK client
            table.string("client_id").notNullable();
            table.foreign("client_id")
                .references("id")
                .inTable("clients")
                .onDelete("CASCADE"); // OPTION RECOMMANDÉE

            table.float("montant").notNullable();        // principal
            table.float("taux").notNullable();           // taux annuel %
            table.integer("duree").notNullable();        // durée en mois
            table.string("date").notNullable();

            table.float("interets").defaultTo(0);
            table.float("solde").defaultTo(0);            // solde restant
            table.string("statut").defaultTo("ACTIF");    // ACTIF / REMBOURSÉ
            
            table.timestamp("creer_depuis").defaultTo(db.fn.now());
        });

        console.log("Table 'loans' créée.");
    }

    // =================== PAYMENTS ===================
    const hasPaiements = await db.schema.hasTable("paiements");
    if (!hasPaiements) {
        await db.schema.createTable("paiements", (table) => {
            table.string("id").primary();
            
            // FK loan
            table.string("loan_id").notNullable();
            table.foreign("loan_id")
                .references("id")
                .inTable("loans")
                .onDelete("CASCADE"); // IMPORTANT
            
            table.float("montant").notNullable();
            table.string("date").notNullable();
            table.string("mode").notNullable(); // cash, carte, etc.
            table.string("note");
            
            table.timestamp("creer_depuis").defaultTo(db.fn.now());
        });

        console.log("Table 'paiements' créée.");
    }

}

module.exports = { db, createTable };
