import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import uuidv1 from 'uuid/v1';
import store from 'store';
import * as types from 'actions/actionTypes';
import MLRAuthApi from 'apis/MLAuthApi';
import CommitsApi from 'apis/CommitsApi.ts';
import UserApi from './apiMocks/UserApi.ts';

const userApi = new UserApi();
const authApi = new MLRAuthApi();
const projectApi = new ProjectGeneralInfoApi();
const commitApi = new CommitsApi();

let project;
// {
//   id: '4aeff3dd-53ea-4fe0-8d38-976de7ec0158',
//     slug: 'can-create-project',
//     url: 'http://ec2-3-127-37-169.eu-central-1.compute.amazonaws.com:10080/TEST-ProjectGeneralInfoApi.4edcf290/can-create-project',
//     owner_id: '09c0b777-31e8-4420-813c-89db7c75314c',
//     name: 'Can create project',
//     gitlab_namespace: 'TEST-ProjectGeneralInfoApi.4edcf290',
//     gitlab_path: 'can-create-project',
//     gitlab_id: 51,
//     visibility_scope: 'PRIVATE',
//     description: '',
//     tags: [],
//     stars_count: 0,
//     forks_count: 0,
//     input_data_types: [],
//     output_data_types: [],
//     searchable_type: 'DATA_PROJECT',
//     experiments: [],
// }

jest.setTimeout(30000);
beforeAll(async () => {
  // ------------- create the user ------------- //
  const suffix = uuidv1().toString().split('-')[0];
  const username = `TEST-ProjectGeneralInfoApi.${suffix}`;
  const password = 'password';
  const email = `TEST-Node.${suffix}@example.com`;
  const registerData = {
    username,
    email,
    password,
    name: username,
  };
  const registerResponse = await userApi.register(registerData);
  expect(registerResponse.ok).toBeTruthy();

  // ----------- login with newly create user ----------- //
  if (!store.getState().user.isAuth) {
    await authApi.login(username, email, password)
      .then((user) => store.dispatch({ type: types.LOGIN, user }));
  }

  const request = {
    name: 'Commits API test project',
    slug: 'can-create-project',
    namespace: '',
    initialize_with_readme: false,
    description: '',
    visibility: 'private',
    input_data_types: [],
  };

  const response = await projectApi.create(request, 'data-project', false)
    .catch((err) => {
      expect(true).not.toBe(true);
      return err;
    });

  expect(response.name).toBe(request.name);
  expect(response.slug).toBe(request.slug);
  project = response;
  console.log(`Running Commits tests against project: ${project.url}`);
});

test('Can commit files ', async () => {
  const response = await commitApi.performCommit(
    project.gitlab_id,
    'data/text.txt',
    '####',
    'master',
    'Can commit files',
    'create',
  );
  expect(response.title).toBe('Can commit files');
  expect(response.project_id).toBe(project.gitlab_id);
});

test('Can get commits', async () => {
  const response = await commitApi.getCommits(
    project.gitlab_id,
    'master',
  );

  // expect exactly 1 commit from the previous test
  expect(response.length).toBe(1);
});