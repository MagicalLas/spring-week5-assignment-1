import { MemoryRouter, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { getDefaultMiddleware } from '@reduxjs/toolkit';

import { render, waitFor, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import ProductDetailPage from './ProductDetailPage';

import { setProduct, initializeStatus } from '../redux/slice';

import { productsFixture } from '../fixtures/products';

const mockStore = configureStore(getDefaultMiddleware());

jest.mock('react-redux');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
jest.mock('../api/products');

describe('ProductDetailPage', () => {
  let store;

  const renderProductDetailPage = () => render((
    <MemoryRouter>
      <ProductDetailPage />
    </MemoryRouter>
  ));

  beforeEach(() => {
    useParams.mockImplementation(() => ({
      id: 1,
    }));
  });

  beforeEach(() => {
    store = mockStore(() => ({
      product: productsFixture[0],
      mode: 'READ',
      status: given.status,
    }));
    useSelector.mockImplementation((selector) => selector(store.getState()));
    useDispatch.mockImplementation(() => store.dispatch);
  });

  it('renders', () => {
    const { container } = renderProductDetailPage();

    expect(container).toHaveTextContent('고양이 장난감 상세');
    expect(container).toHaveTextContent(productsFixture[0].name);
    expect(container).toHaveTextContent(productsFixture[0].maker);
    expect(container).toHaveTextContent(`${productsFixture[0].price}원`);
  });

  it('runs loadProduct action', async () => {
    renderProductDetailPage();

    await waitFor(() => {
      const actions = store.getActions();

      expect(setProduct.match(actions[0])).toBe(true);
    });
  });

  context('when status is fail', () => {
    beforeEach(() => {
      given('status', () => ({ type: 'FAIL', message: 'Error message' }));
    });

    it('shows messge alert', () => {
      renderProductDetailPage();

      const actions = store.getActions();

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(initializeStatus.match(actions[0])).toBe(true);
    });
  });
});
