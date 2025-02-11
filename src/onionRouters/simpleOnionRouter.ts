import express, { Request, Response } from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";

// Définition des variables globales pour stocker les messages
let lastReceivedEncryptedMessage: string | null = null;
let lastReceivedDecryptedMessage: string | null = null;
let lastMessageDestination: number | null = null;

// Fonction principale pour initialiser un simple Onion Router
export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();

  // Middleware pour parser les requêtes JSON
  onionRouter.use(express.json());

  // Route de statut pour vérifier que le serveur fonctionne
  onionRouter.get("/status", (req: Request, res: Response) => {
    res.status(200).send("live");
  });

  // Route pour récupérer le dernier message chiffré reçu
  onionRouter.get("/getLastReceivedEncryptedMessage", (req: Request, res: Response) => {
    res.status(200).json({ result: lastReceivedEncryptedMessage ?? null });
  });

  // Route pour récupérer le dernier message déchiffré reçu
  onionRouter.get("/getLastReceivedDecryptedMessage", (req: Request, res: Response) => {
    res.status(200).json({ result: lastReceivedDecryptedMessage ?? null });
  });

  // Route pour récupérer la dernière destination de message
  onionRouter.get("/getLastMessageDestination", (req: Request, res: Response) => {
    res.status(200).json({ result: lastMessageDestination ?? null });
  });

  // Lancement du serveur sur le port spécifié
  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(`Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
  });

  return server;
}
