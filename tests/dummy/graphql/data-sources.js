import { RESTDataSource } from 'apollo-datasource-rest';

class PeopleAPI extends RESTDataSource {
  find() {
    return ['Paul'];
  }
}

export default {
  people: new PeopleAPI()
};
