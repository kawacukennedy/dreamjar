import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    walletAddress: String!
    displayName: String
    avatarUrl: String
    createdAt: String!
    lastSeen: String!
  }

  type WishJar {
    id: ID!
    owner: User!
    title: String!
    description: String!
    category: String
    contractAddress: String!
    stakeAmount: Float!
    pledgedAmount: Float!
    deadline: String!
    status: String!
    validatorMode: String!
    validators: [String]
    createdAt: String!
  }

  type Pledge {
    id: ID!
    wishJar: WishJar!
    supporter: User!
    amount: Float!
    txHash: String!
    createdAt: String!
  }

  type Query {
    wishes(limit: Int, offset: Int): [WishJar!]!
    wish(id: ID!): WishJar
    myWishes: [WishJar!]!
    stats: Stats!
  }

  type Stats {
    totalWishes: Int!
    activeWishes: Int!
    totalPledged: Float!
    totalUsers: Int!
  }

  type Mutation {
    createWish(
      title: String!
      description: String!
      category: String
      stakeAmount: Float!
      deadline: String!
      validatorMode: String!
      validators: [String]
    ): WishJar!
    pledge(wishId: ID!, amount: Float!): Pledge!
  }

  type Subscription {
    wishUpdated(id: ID!): WishJar!
    newPledge(wishId: ID!): Pledge!
  }
`;
