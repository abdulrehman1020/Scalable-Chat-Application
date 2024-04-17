const { Kafka } = require("kafkajs");
const fs = require('fs');
const path = require('path');
const Message = require("./messages");

const kafka = new Kafka({
  brokers: [""],
  ssl: {
    ca: [],
  },
  sasl: {
    username: "",
    password: "",
    mechanism: "",
  },
});

let producer = null;

async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

async function produceMessage(message) {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
  return true;
}

async function startMessageConsumer() {
  console.log("Consumer is running..");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message || !message.value) return; // Check if message or message.value is undefined or null
      console.log(`New Message Recv..`, message.value?.toString());
      try {
        await Message.create({
          message: {
            text: message,
          },
        });
      } catch (err) {
        console.log("Something is wrong");
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

module.exports = {produceMessage, startMessageConsumer}