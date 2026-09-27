import ledgerSchema from "../models/ledger.model.js";
import transactionSchema from "../models/transaction.model.js";
import categorySchema from "../models/category.model.js";

export const LEDGER_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const destroyLedgerData = async (ledgerId) => {
    const id = String(ledgerId);
    await transactionSchema.deleteMany({ ledgerId: id });
    await categorySchema.deleteMany({ ledgerId: id });
    await ledgerSchema.deleteOne({ _id: ledgerId });
};

let purgeInFlight = null;

const runPurge = async () => {
    const cutoff = new Date(Date.now() - LEDGER_RETENTION_MS);
    const expired = await ledgerSchema.find({
        deletedAt: { $ne: null, $lte: cutoff },
    });

    for (const ledger of expired) {
        await destroyLedgerData(ledger._id);
    }

    return expired.length;
};

export const purgeExpiredLedgers = () => {
    if (!purgeInFlight) {
        purgeInFlight = runPurge().finally(() => {
            purgeInFlight = null;
        });
    }
    return purgeInFlight;
};
