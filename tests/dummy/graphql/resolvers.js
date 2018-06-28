export default {
  Query: {
    hello: () => 'Hello World!',
    nowDate: () => new Date(),
    nowTime: () => new Date(),
    nowDateTime: () => new Date(),

    people: (root, _, { dataSources }) => {
      return dataSources.people.find();
    }
  }
};
