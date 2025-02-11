import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

// Types pour les nœuds
export type Node = {
  nodeId: number;
  pubKey: string;
  privateKey?: string; // Ajout d'une option pour la clé privée
};

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

// Stockage des nœuds en mémoire (registre simplifié)
const nodeRegistry: Node[] = [];

export async function launchRegistry() {
  const app = express();

  // Middleware pour parser les requêtes JSON
  app.use(express.json());

  // Route de statut pour vérifier que le serveur fonctionne
  app.get("/status", (req: Request, res: Response) => {
    res.status(200).send("live");
  });

  /**
   * Route pour enregistrer un nœud
   * POST /registerNode
   */
  app.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    // Validation des champs requis
    if (!nodeId || !pubKey) {
      return res.status(400).json({ error: "Invalid input: nodeId and pubKey are required." });
    }

    // Vérification du format de la clé publique
    if (typeof pubKey !== "string" || pubKey.length < 64) {
      return res.status(400).json({ error: "Invalid pubKey format. It should be a string with at least 64 characters." });
    }

    // Vérifiez si le nœud est déjà enregistré
    const isNodeAlreadyRegistered = nodeRegistry.some((node) => node.nodeId === nodeId);
    if (isNodeAlreadyRegistered) {
      return res.status(409).json({ error: "Node with this nodeId is already registered." });
    }

    // Enregistrer le nœud
    nodeRegistry.push({ nodeId, pubKey });
    return res.status(201).json({ message: "Node registered successfully.", node: { nodeId, pubKey } });
  });

  /**
   * Route pour récupérer tous les nœuds enregistrés
   * GET /getNodeRegistry
   */
  app.get("/getNodeRegistry", (req: Request, res: Response) => {
    const body: GetNodeRegistryBody = { nodes: nodeRegistry };
    return res.status(200).json(body);
  });

  /**
   * Route pour obtenir la clé privée d'un nœud
   * GET /getPrivateKey
   */
  app.get("/getPrivateKey", (req: Request, res: Response) => {
    const nodeId = parseInt(req.query.nodeId as string, 10); // Convertir l'ID en nombre

    const node = nodeRegistry.find(n => n.nodeId === nodeId);
    if (!node) {
      return res.status(404).json({ error: "Node not found." });
    }

    if (!node.privateKey) {
      return res.status(404).json({ error: "Private key not set." });
    }

    // Retourner la clé privée
    return res.status(200).json({ result: node.privateKey });
  });

  // Lancement du serveur sur le port spécifié
  const server = app.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
