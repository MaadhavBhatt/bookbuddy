// Mock Firestore implementation that uses localStorage

// Get data from localStorage
const getLocalData = (collectionName) => {
  const data = localStorage.getItem(`bookbuddy_${collectionName}`);
  return data ? JSON.parse(data) : [];
};

// Save data to localStorage
const saveLocalData = (collectionName, data) => {
  localStorage.setItem(`bookbuddy_${collectionName}`, JSON.stringify(data));
};

// Mock Firestore collection reference
export const collection = (db, collectionName) => {
  return { id: collectionName, path: collectionName };
};

// Mock document reference
export const doc = (db, collectionName, docId) => {
  return { id: docId, path: `${collectionName}/${docId}` };
};

// Mock adding a document
export const addDoc = async (collectionRef, data) => {
  const collectionName = collectionRef.id;
  const items = getLocalData(collectionName);
  const newDoc = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  items.push(newDoc);
  saveLocalData(collectionName, items);
  return { id: newDoc.id };
};

// Mock getting a document
export const getDoc = async (docRef) => {
  const [collectionName, docId] = docRef.path.split('/');
  const items = getLocalData(collectionName);
  const item = items.find((item) => item.id === docId);

  return {
    exists: () => !!item,
    data: () => item || null,
    id: docId,
  };
};

// Mock getting all documents in a collection
export const getDocs = async (querySnapshot) => {
  let items;

  if (querySnapshot.id) {
    // It's a collection reference
    items = getLocalData(querySnapshot.id);
  } else {
    // It's a query
    const { collectionRef, filters } = querySnapshot;
    items = getLocalData(collectionRef.id);

    // Apply filters
    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        const [field, operator, value] = filter;
        items = items.filter((item) => {
          if (operator === '==') return item[field] === value;
          if (operator === '!=') return item[field] !== value;
          if (operator === '>') return item[field] > value;
          if (operator === '<') return item[field] < value;
          return true;
        });
      });
    }
  }

  return {
    docs: items.map((item) => ({
      id: item.id,
      data: () => item,
      exists: () => true,
    })),
    empty: items.length === 0,
    size: items.length,
  };
};

// Mock updating a document
export const updateDoc = async (docRef, data) => {
  const [collectionName, docId] = docRef.path.split('/');
  const items = getLocalData(collectionName);
  const index = items.findIndex((item) => item.id === docId);

  if (index !== -1) {
    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalData(collectionName, items);
    return { id: docId };
  }

  throw new Error('Document not found');
};

// Mock deleting a document
export const deleteDoc = async (docRef) => {
  const [collectionName, docId] = docRef.path.split('/');
  let items = getLocalData(collectionName);
  items = items.filter((item) => item.id !== docId);
  saveLocalData(collectionName, items);
};

// Mock query
export const query = (collectionRef, ...constraints) => {
  const filters = constraints.map((constraint) => {
    if (typeof constraint === 'string') {
      // Extract filter details from the constraint
      const [field, operator, value] = constraint.split('|');
      return [field, operator, value];
    }
    // It's already a parsed constraint
    return constraint._params || ['unknown', '==', null];
  });

  return {
    collectionRef,
    filters,
  };
};

// Mock where clause
export const where = (field, operator, value) => {
  return {
    _type: 'where',
    _params: [field, operator, value],
  };
};
