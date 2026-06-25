import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { validarRetirada } from "./src/utils/validacoes";

export default function App() {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retiradas, setRetiradas] = useState({});
  const [busca, setBusca] = useState("");

  const API_URL =
    "https://6a2b3ed1b687a7d5cbc50251.mockapi.io/api/v1/materials";

  async function carregarMateriais() {
    setLoading(true);

    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();

      setMaterials(dados);
    } catch (error) {
      console.log("Erro ao carregar materiais:", error);
    } finally {
      setLoading(false);
    }
  }

  async function cadastrarMaterial() {
    if (!nome || !quantidade) {
      return;
    }

    const novoMaterial = {
      nome: nome,
      quantidade: Number(quantidade),
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novoMaterial),
      });

      setNome("");
      setQuantidade("");

      carregarMateriais();
    } catch (error) {
      console.log("Erro ao cadastrar material:", error);
    }
  }

  async function baixarMaterial(material) {
    const quantidadeRetirada = Number(retiradas[material.id]);
    const estoqueAtual = Number(material.quantidade);

    if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
      console.log(
        "Operação cancelada: quantidade inválida ou superior ao estoque disponível.",
      );
      return;
    }

    const novaQuantidade = estoqueAtual - quantidadeRetirada;

    try {
      await fetch(`${API_URL}/${material.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...material,
          quantidade: novaQuantidade,
        }),
      });

      carregarMateriais();

      setRetiradas({
        ...retiradas,
        [material.id]: "",
      });
    } catch (error) {
      console.log("Erro ao baixar estoque:", error);
    }
  }

  async function excluirMaterial(id) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      carregarMateriais();

      setRetiradas({
        ...retiradas,
        [id]: "",
      });
    } catch (error) {
      console.log("Erro ao excluir material:", error);
    }
  }

  const materiaisFiltrados = materials.filter((material) =>
    material.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  useEffect(() => {
    carregarMateriais();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>

      <Text style={styles.description}>
        Este template servirá para desenvolver o projeto responsável por
        modernizar o controle de insumos médicos do almoxarifado. Através desta
        interface conectada à API, é possível realizar o inventário em tempo
        real, cadastrar novos materiais e registrar baixas de estoque de forma
        ágil e segura.
      </Text>

      <TextInput
        testID="input-nome"
        style={styles.input}
        placeholder="Nome do material"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        testID="input-quantidade"
        style={styles.input}
        placeholder="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
      />

      <TouchableOpacity
        testID="btn-cadastrar"
        style={styles.button}
        onPress={cadastrarMaterial}
      >
        <Text style={styles.buttonText}>Cadastrar Material</Text>
      </TouchableOpacity>

      <TextInput
        testID="input-busca"
        style={styles.input}
        placeholder="Buscar material"
        value={busca}
        onChangeText={setBusca}
      />

      <Text style={styles.subtitle}>Materiais cadastrados</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" />
      ) : (
        <FlatList
          testID="lista-materials"
          data={materiaisFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.materialName}>{item.nome}</Text>

              <Text>Quantidade: {item.quantidade}</Text>

              <TextInput
                testID="input-retirada"
                style={styles.input}
                placeholder="Quantidade para retirar"
                value={retiradas[item.id] || ""}
                onChangeText={(texto) =>
                  setRetiradas({
                    ...retiradas,
                    [item.id]: texto,
                  })
                }
                keyboardType="numeric"
              />

              <TouchableOpacity
                testID="btn-baixar"
                style={styles.buttonBaixar}
                onPress={() => baixarMaterial(item)}
              >
                <Text style={styles.buttonText}>Baixar Estoque</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="btn-excluir"
                style={styles.buttonExcluir}
                onPress={() => excluirMaterial(item.id)}
              >
                <Text style={styles.buttonText}>Excluir Material</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonBaixar: {
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  buttonExcluir: {
    backgroundColor: "#D32F2F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
  },
  materialName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
});
