import express, { Request, Response } from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

// Variables globales pour stocker les messages
let lastReceivedMessage: string | null = null; // Dernier message reçu
let lastSentMessage: string | null = null; // Dernier message envoyé

// Fonction principale pour initialiser un utilisateur
export async function user(userId: number) {
  const _user = express();

  // Middleware pour parser les requêtes JSON
  _user.use(express.json());

  // Route de statut pour vérifier que le serveur fonctionne
  _user.get("/status", (req: Request, res: Response) => {
    res.status(200).send("live");
  });

  /**
   * Route pour recevoir un message (via `/message`)
   */
  _user.post("/message", (req: Request, res: Response) => {
    const { message } = req.body;

    // Validation : Vérifiez que le message est présent dans le corps de la requête
    if (!message) {
      return res.status(400).json({ error: "Invalid message. A valid 'message' field is required." });
    }

    lastReceivedMessage = message; // Stocker le dernier message reçu
    return res.status(200).json({ result: "Message received successfully." });
  });

  /**
   * Route pour obtenir le dernier message reçu (via `/getLastReceivedMessage`)
   */
  _user.get("/getLastReceivedMessage", (req: Request, res: Response) => {
    // Renvoyer l'état actuel de `lastReceivedMessage`
    return res.status(200).json({ result: lastReceivedMessage ?? null });
  });

  /**
   * Route pour envoyer un message (simule l'envoi d'un message, via `/sendMessage`)
   */
  _user.post("/sendMessage", (req: Request, res: Response) => {
    const { message } = req.body;

    // Validation : Vérifiez que le message est présent dans le corps de la requête
    if (!message) {
      return res.status(400).json({ error: "Invalid message. A valid 'message' field is required." });
    }

    lastSentMessage = message; // Stocker le dernier message envoyé
    return res.status(200).json({ result: "Message sent successfully." });
  });

  /**
   * Route pour récupérer le dernier message envoyé (via `/getLastSentMessage`)
   */
  _user.get("/getLastSentMessage", (req: Request, res: Response) => {
    // Renvoyer l'état actuel de `lastSentMessage`
    return res.status(200).json({ result: lastSentMessage ?? null });
  });

  // Lancement du serveur Express avec un port unique basé sur `userId`
  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(`User ${userId} is listening on port ${BASE_USER_PORT + userId}`);
  });

  return server;
}
