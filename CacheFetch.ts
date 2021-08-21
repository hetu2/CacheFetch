const LOGGER_MESSAGES = {
  UPDATE_WORKS: "CACHE updated: ",
  UPDATE_ERROR_1: "CACHE failed to update: ",
  UPDATE_ERROR_2: "CACHE failed to error: ",
  TRANSLATIONS_FROM_CACHE: "from CACHE: ",
} as const;

const dependencies = {
  http: {
    get: async (uri) => {
      const r = await fetch(uri)
        .then((response) => response.json())
        .then((data) => data);

      return r;
    },
  },
  logger: console.log,
};

type TypeDependencies = typeof dependencies;

export const makeCacheFetch = ({ http, logger }: TypeDependencies): any => {
  return class CacheFetch {
    data: any;
    name: string;
    timeBuffer = 1000;
    timeLastUpdate = 0;
    uri: string;

    constructor(private props: { [key: string]: any }) {
      const { timeBuffer, name, uri } = this.props;
      this.timeBuffer = timeBuffer;
      this.name = name;
      this.uri = uri;
    }

    public async execute(): Promise<any> {
      if (this.timeLastUpdate === 0 && !this.data) {
        await this.updateData();
        return this.data;
      } else if (this.timeLastUpdate < Date.now()) {
        await this.updateData();
        return this.data;
      } else {
        logger(LOGGER_MESSAGES.TRANSLATIONS_FROM_CACHE + this.name);
      }
      return this.data;
    }

    private updateLastUpdate() {
      this.timeLastUpdate = Date.now() + this.timeBuffer;
    }
    private async updateData() {
      this.updateLastUpdate();

      try {
        const rtn = await http.get(this.uri);
        if (rtn && rtn.data) {
          this.data = rtn.data;
          logger(LOGGER_MESSAGES.UPDATE_WORKS + this.name);
        } else {
          logger(LOGGER_MESSAGES.UPDATE_ERROR_1 + this.name);
        }
      } catch (e) {
        logger(LOGGER_MESSAGES.UPDATE_ERROR_2 + this.name);
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  };
};

const CacheFetch = makeCacheFetch(dependencies);

export default CacheFetch;
