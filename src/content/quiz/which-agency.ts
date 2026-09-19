import type { QuizDefinition } from "@/content/quiz/types";

/**
 * A personality quiz with one branch, used as the engine's first real
 * content.
 *
 * APPEND-ONLY once published. Shared result links encode answers by question
 * position, so reordering or removing a question silently changes what every
 * existing link decodes to. Add questions at the end; never renumber.
 * quiz.test.ts pins the ids to make a careless edit fail.
 */
export const whichAgency: QuizDefinition = {
  slug: "which-agency",
  title: "Which Weast Wing Agency Are You?",
  summary:
    "A seven-question aptitude screening to determine where in the federal apparatus you would do the least identifiable harm.",
  intro:
    "Answer honestly. Your responses are not recorded, reviewed, or read by anyone, which is also true of most federal aptitude screenings.",
  formNumber: "Form POS-88 (Rev. 09/2026)",
  strategy: "personality",

  outcomes: [
    {
      id: "pos",
      kicker: "Presidential Office of Shitistics",
      title: "You belong to POS",
      body: "You believe a number, stated confidently and updated daily, is a form of argument. You are not wrong often, because you are careful never to say anything falsifiable. When the count resets you will be the first to explain that the count was always going to reset.",
    },
    {
      id: "bea",
      kicker: "Bureau of Executive Anomalies",
      title: "You belong to the BEA",
      body: "Other people see a problem. You see a matter outside the jurisdiction of anyone currently in the room. Your explanations are issued with total confidence and reviewed by no one, which you consider a feature of the process rather than a description of it.",
    },
    {
      id: "comms",
      kicker: "Office of Strategic Rewording",
      title: "You belong in Communications",
      body: "You have never lied. You have, on several occasions, arranged true things in an order that produced a false impression, and you maintain that these are different activities. They are, in fairness, spelled differently.",
    },
    {
      id: "janitorial",
      kicker: "Facilities and Sanitation",
      title: "You belong to Facilities",
      body: "You are the only person in this building who deals with the actual thing, rather than a document about the thing. Everyone above you will be promoted. You will be thanked once, in an email, by someone who spells your name wrong.",
    },
  ],

  questions: [
    {
      id: "q1",
      prompt:
        "A senior official has done something visibly and undeniably embarrassing. What is your first move?",
      options: [
        {
          id: "a",
          label: "Establish a baseline so we know whether this is even statistically unusual",
          weights: { pos: 3 },
        },
        {
          id: "b",
          label: "Determine whether it falls under our jurisdiction, which it does not",
          weights: { bea: 3 },
        },
        {
          id: "c",
          label: "Draft three sentences that are each individually true",
          weights: { comms: 3 },
        },
        { id: "d", label: "Get the cart", weights: { janitorial: 3 } },
      ],
    },
    {
      id: "q2",
      prompt: "You are asked for the number. You do not have the number.",
      options: [
        { id: "a", label: "Give a range. Ranges are numbers.", weights: { pos: 2, comms: 1 } },
        {
          id: "b",
          label: "Give last quarter's number and say 'as of the last full reporting period'",
          weights: { comms: 3 },
        },
        {
          id: "c",
          label: "Explain that the number is being recalculated under a revised methodology",
          weights: { pos: 2, bea: 1 },
          // Anyone comfortable inventing a methodology gets the methodology question.
          next: "q3-method",
        },
        { id: "d", label: "Say you don't have the number", weights: { janitorial: 3 } },
      ],
    },
    {
      id: "q3-method",
      prompt: "Describe the revised methodology.",
      help: "This question only appears if you claimed one exists.",
      options: [
        {
          id: "a",
          label: "It is more rigorous than the old one in ways I will detail later",
          weights: { pos: 3 },
        },
        {
          id: "b",
          label: "It is the old one, but we now round differently",
          weights: { pos: 2, comms: 2 },
        },
        {
          id: "c",
          label: "There is no methodology. There is a spreadsheet and a feeling.",
          weights: { bea: 3 },
        },
      ],
    },
    {
      id: "q4",
      prompt: "A journalist asks a question you were specifically told not to answer.",
      options: [
        { id: "a", label: "Answer a nearby question very thoroughly", weights: { comms: 3 } },
        {
          id: "b",
          label: "Refer them to the agency that does not handle this",
          weights: { bea: 3 },
        },
        { id: "c", label: "Cite the data. There is always data.", weights: { pos: 3 } },
        { id: "d", label: "Tell them, because they asked", weights: { janitorial: 3 } },
      ],
    },
    {
      id: "q5",
      prompt: "The official response you drafted has been described as 'unconvincing'.",
      options: [
        {
          id: "a",
          label: "It was never meant to convince. It was meant to exist.",
          weights: { comms: 2, bea: 2 },
        },
        {
          id: "b",
          label: "Convincing is a subjective standard and I would like to see their figures",
          weights: { pos: 3 },
        },
        { id: "c", label: "Issue a second one, with total confidence", weights: { bea: 3 } },
        { id: "d", label: "It was unconvincing", weights: { janitorial: 3 } },
      ],
    },
    {
      id: "q6",
      prompt: "Something has gone wrong and nobody has noticed yet.",
      options: [
        {
          id: "a",
          label: "Note the date. It will matter which reporting period this lands in.",
          weights: { pos: 3 },
        },
        {
          id: "b",
          label: "Classify it. A classified problem is a managed problem.",
          weights: { bea: 3 },
        },
        {
          id: "c",
          label: "Get ahead of it with a statement about transparency",
          weights: { comms: 3 },
        },
        { id: "d", label: "Fix it before anyone notices", weights: { janitorial: 3 } },
      ],
    },
    {
      id: "q7",
      prompt: "Last one. Why do you work here?",
      options: [
        {
          id: "a",
          label: "The work is important and somebody has to count it",
          weights: { pos: 2 },
        },
        {
          id: "b",
          label: "I have never been able to explain what I do and nobody has ever asked twice",
          weights: { bea: 2 },
        },
        {
          id: "c",
          label: "I am extremely good at this and it is not a skill I can use anywhere pleasant",
          weights: { comms: 2 },
        },
        { id: "d", label: "The building has to stay standing", weights: { janitorial: 2 } },
      ],
    },
  ],
};
